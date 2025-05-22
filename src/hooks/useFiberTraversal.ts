import { useState, useCallback, useEffect } from 'react';
import { FiberRFNode, FiberNodeData } from '@/types/fiber'; // Adjust path

export type TraversalAction = 
  | 'INITIAL' 
  | 'BEGIN_WORK' 
  | 'VISIT_CHILD' 
  | 'VISIT_SIBLING' 
  | 'RETURN_TO_PARENT' 
  | 'COMPLETE_WORK' 
  | 'FINISHED';

export interface TraversalStep {
  nodeId: string | null; // Context node for the action (e.g., parent when visiting child)
  action: TraversalAction;
  message: string;
  stack: string[]; // Array of node IDs in the conceptual DFS stack (from workStack)
  
  processedNodeId?: string | null; // Node whose 'work' is being done/completed, or node being visited
  targetNodeId?: string | null; // Next node to move to (for edge highlighting)
  edgeType?: 'child' | 'sibling' | 'return' | null; // Type of edge to targetNodeId
}

interface TraversalManager {
  allNodes: Map<string, FiberRFNode>;
  rootNodeId: string | null;
  history: TraversalStep[];
  currentIndex: number; 
  workStack: FiberRFNode[]; 
}

const initialTraversalStep: TraversalStep = {
  nodeId: null,
  action: 'INITIAL',
  message: 'Traversal not started.',
  stack: [],
  processedNodeId: null,
};

export const useFiberTraversal = () => {
  const [manager, setManager] = useState<TraversalManager>({
    allNodes: new Map(),
    rootNodeId: null,
    history: [initialTraversalStep],
    currentIndex: 0,
    workStack: [],
  });

  const [isRunning, setIsRunning] = useState(false);
  const currentStep = manager.history[manager.currentIndex];
  const isFinished = currentStep?.action === 'FINISHED';

  const buildNodeMap = (nodes: FiberRFNode[]): Map<string, FiberRFNode> => {
    const map = new Map<string, FiberRFNode>();
    nodes.forEach(node => map.set(node.id, node));
    return map;
  };

  const initializeTraversal = useCallback((nodes: FiberRFNode[], rootIdFromInput: string | null) => {
    if (!nodes.length || !rootIdFromInput) {
      setManager({
        allNodes: new Map(),
        rootNodeId: null,
        history: [initialTraversalStep],
        currentIndex: 0,
        workStack: [],
      });
      setIsRunning(false);
      return;
    }

    const allNodesMap = buildNodeMap(nodes);
    const rootNode = allNodesMap.get(rootIdFromInput);

    if (!rootNode) {
        console.error("Root node not found in provided nodes.");
        setManager(prev => ({ ...prev, history: [initialTraversalStep], currentIndex: 0, workStack: [] }));
        setIsRunning(false);
        return;
    }
    
    const firstStep: TraversalStep = {
      nodeId: rootNode.id, 
      action: 'BEGIN_WORK',
      message: `Starting at root: ${rootNode.data?.displayName || rootNode.id}. Beginning work.`,
      stack: [rootNode.id],
      processedNodeId: rootNode.id, 
    };

    setManager({
      allNodes: allNodesMap,
      rootNodeId: rootNode.id,
      history: [firstStep],
      currentIndex: 0,
      workStack: [rootNode], 
    });
    setIsRunning(false);
  }, []);

  const performNextStep = useCallback(() => {
    setManager(prevManager => {
      if (prevManager.currentIndex < prevManager.history.length - 1 && !isRunning) {
        return { ...prevManager, currentIndex: prevManager.currentIndex + 1 };
      }

      const lastHistoricalStep = prevManager.history[prevManager.history.length - 1];
      if (lastHistoricalStep.action === 'FINISHED') {
        setIsRunning(false);
        return prevManager;
      }

      let currentWorkStack = [...prevManager.workStack];
      let nextStepsBatch: TraversalStep[] = [];

      if (currentWorkStack.length === 0) {
        nextStepsBatch.push({
          nodeId: null, action: 'FINISHED', message: 'Traversal complete (work stack empty).', stack: [], processedNodeId: lastHistoricalStep.processedNodeId
        });
        setIsRunning(false);
      } else {
        const currentFiber = currentWorkStack[currentWorkStack.length - 1];
        if (!currentFiber || !currentFiber.data) {
          nextStepsBatch.push({ nodeId: null, action: 'FINISHED', message: 'Error: Invalid current fiber in work stack.', stack: [], processedNodeId: null });
          setIsRunning(false);
        } else {
          // Determine if currentFiber's work has just begun or if we are returning to it.
          const isJustBegun = lastHistoricalStep.action === 'BEGIN_WORK' && lastHistoricalStep.processedNodeId === currentFiber.id;
          const isReturningFromChild = lastHistoricalStep.action === 'RETURN_TO_PARENT' && lastHistoricalStep.targetNodeId === currentFiber.id;
          const isReturningFromSiblingCompletion = lastHistoricalStep.action === 'COMPLETE_WORK' && prevManager.allNodes.get(lastHistoricalStep.processedNodeId || '')?.data.returnId === currentFiber.id;


          // Phase 1: Try to Visit Child
          // This happens if currentFiber's work just began, or if we returned to it from a child and now check its next child (not applicable here as only one child pointer).
          if (isJustBegun) {
            const childId = currentFiber.data.childId;
            const childNode = childId ? prevManager.allNodes.get(childId) : null;

            if (childNode) {
              nextStepsBatch.push({
                nodeId: currentFiber.id, action: 'VISIT_CHILD',
                message: `Visiting child ${childNode.data?.displayName || childId} of ${currentFiber.data.displayName}.`,
                stack: currentWorkStack.map(n => n.id).concat(childId), // Tentative stack for this step
                processedNodeId: currentFiber.id, targetNodeId: childId, edgeType: 'child',
              });
              currentWorkStack.push(childNode); // Actually modify stack for next BEGIN_WORK
              nextStepsBatch.push({
                nodeId: childId, action: 'BEGIN_WORK',
                message: `Beginning work on ${childNode.data?.displayName || childId}.`,
                stack: currentWorkStack.map(n => n.id), processedNodeId: childId,
              });
            } else {
              // No child, proceed to complete work on currentFiber
              nextStepsBatch.push({
                nodeId: currentFiber.id, action: 'COMPLETE_WORK',
                message: `No children for ${currentFiber.data.displayName}. Completing work.`,
                stack: currentWorkStack.map(n => n.id), processedNodeId: currentFiber.id,
              });
            }
          } 
          // Phase 2: Try to Visit Sibling or Return to Parent (after currentFiber or its child subtree is completed)
          // This occurs if the last action was COMPLETE_WORK for currentFiber, or for a child of currentFiber (leading to RETURN_TO_PARENT which then leads here).
          else if (lastHistoricalStep.action === 'COMPLETE_WORK' && lastHistoricalStep.processedNodeId === currentFiber.id) {
            currentWorkStack.pop(); // Pop currentFiber, its work is done.

            const siblingId = currentFiber.data.siblingId;
            const siblingNode = siblingId ? prevManager.allNodes.get(siblingId) : null;

            if (siblingNode) {
              nextStepsBatch.push({
                nodeId: currentFiber.id, action: 'VISIT_SIBLING',
                message: `Visiting sibling ${siblingNode.data?.displayName || siblingId} of ${currentFiber.data.displayName}.`,
                stack: currentWorkStack.map(n => n.id).concat(siblingId), // Tentative stack
                processedNodeId: currentFiber.id, targetNodeId: siblingId, edgeType: 'sibling',
              });
              currentWorkStack.push(siblingNode); // Modify stack for next BEGIN_WORK
              nextStepsBatch.push({
                nodeId: siblingId, action: 'BEGIN_WORK',
                message: `Beginning work on ${siblingNode.data?.displayName || siblingId}.`,
                stack: currentWorkStack.map(n => n.id), processedNodeId: siblingId,
              });
            } else {
              // No sibling, try to return to parent
              const parentId = currentFiber.data.returnId;
              const parentNode = parentId ? prevManager.allNodes.get(parentId) : null;

              if (parentNode) {
                // Parent is at currentWorkStack[currentWorkStack.length - 1]
                nextStepsBatch.push({
                  nodeId: currentFiber.id, action: 'RETURN_TO_PARENT',
                  message: `Returning from ${currentFiber.data.displayName} to parent ${parentNode.data?.displayName || parentId}.`,
                  stack: currentWorkStack.map(n => n.id),
                  processedNodeId: currentFiber.id, targetNodeId: parentId, edgeType: 'return',
                });
                // The next step will be COMPLETE_WORK for the parent (handled by next iteration)
                 nextStepsBatch.push({
                    nodeId: parentId, action: 'COMPLETE_WORK',
                    message: `Completed children of ${parentNode.data?.displayName || parentId}. Completing work.`,
                    stack: currentWorkStack.map(n => n.id), processedNodeId: parentId,
                });
              } else {
                // No parent to return to (currentFiber was root or orphan)
                nextStepsBatch.push({
                  nodeId: currentFiber.id, action: 'FINISHED',
                  message: `Traversal finished. ${currentFiber.data.displayName} was the last processed node.`,
                  stack: [], processedNodeId: currentFiber.id,
                });
                setIsRunning(false);
              }
            }
          }
          // This case handles when we returned to parent. The parent now needs to be marked as 'COMPLETE_WORK'.
          // Or, if a sibling was just completed, and that sibling returned to *its* parent (which is currentFiber), currentFiber also completes.
          else if (isReturningFromChild || isReturningFromSiblingCompletion) {
             nextStepsBatch.push({
                nodeId: currentFiber.id, action: 'COMPLETE_WORK',
                message: `Children/subtree of ${currentFiber.data?.displayName || currentFiber.id} completed. Completing work.`,
                stack: currentWorkStack.map(n => n.id), processedNodeId: currentFiber.id,
            });
          } else if (lastHistoricalStep.action === 'VISIT_CHILD' || lastHistoricalStep.action === 'VISIT_SIBLING') {
            // This case should not happen if BEGIN_WORK is always paired with VISIT_CHILD/VISIT_SIBLING.
            // It implies that a VISIT action was not followed by BEGIN_WORK, so the stack is misaligned.
            // For robustness, we can try to force a BEGIN_WORK on the target of the last VISIT action.
            const targetOfVisit = lastHistoricalStep.targetNodeId;
            if (targetOfVisit && currentFiber.id === targetOfVisit) { // currentFiber should be the target of last visit
                 nextStepsBatch.push({
                    nodeId: targetOfVisit, action: 'BEGIN_WORK',
                    message: `(Recovery) Beginning work on ${currentFiber.data?.displayName || targetOfVisit}.`,
                    stack: currentWorkStack.map(n => n.id), processedNodeId: targetOfVisit,
                });
            } else {
                console.error("Traversal logic error: Unhandled state after VISIT action.", lastHistoricalStep, currentFiber.id);
                nextStepsBatch.push({ nodeId: null, action: 'FINISHED', message: 'Error: Traversal logic error.', stack: [], processedNodeId: null });
                setIsRunning(false);
            }
          } else {
            // Fallback or error
            console.warn("performNextStep: Unhandled state or loop.", lastHistoricalStep, currentFiber.id);
            // To prevent infinite loops if logic is flawed, force finish.
            nextStepsBatch.push({ nodeId: currentFiber.id, action: 'FINISHED', message: 'Error: Unhandled traversal state.', stack: [], processedNodeId: currentFiber.id });
            setIsRunning(false);
          }
        }
      }
      
      // Update manager state
      const newHistory = [...prevManager.history, ...nextStepsBatch];
      return {
        ...prevManager,
        history: newHistory,
        currentIndex: newHistory.length - 1, // Point to the last step in the batch
        workStack: currentWorkStack, 
      };
    });
  }, [isRunning]);


  const prevStep = useCallback(() => {
    setManager(prev => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
    }));
    setIsRunning(false);
  }, []);

  const resetTraversal = useCallback(() => {
    if (manager.allNodes.size > 0 && manager.rootNodeId) {
        const rootNode = manager.allNodes.get(manager.rootNodeId);
        if (rootNode) {
            const firstStep: TraversalStep = {
                nodeId: manager.rootNodeId,
                action: 'BEGIN_WORK',
                message: `Starting traversal at root: ${rootNode.data?.displayName || manager.rootNodeId}. Beginning work.`,
                stack: [manager.rootNodeId],
                processedNodeId: manager.rootNodeId,
            };
             setManager(prev => ({
                ...prev,
                history: [firstStep],
                currentIndex: 0,
                workStack: [rootNode]
            }));
        }
    } else {
        setManager(prev => ({
            ...prev,
            history: [initialTraversalStep],
            currentIndex: 0,
            workStack: []
        }));
    }
    setIsRunning(false);
  }, [manager.allNodes, manager.rootNodeId]);


  const play = useCallback(() => {
    if (currentStep?.action !== 'FINISHED') {
      setIsRunning(true);
      if (manager.currentIndex === manager.history.length - 1 && !isRunning) {
         performNextStep(); 
      }
    }
  }, [currentStep, manager.currentIndex, manager.history.length, performNextStep, isRunning]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);
  
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    if (isRunning && currentStep?.action !== 'FINISHED') {
      timerId = setTimeout(() => {
        performNextStep();
      }, 1000); 
    }
    return () => clearTimeout(timerId);
  }, [isRunning, currentStep, performNextStep]);


  return {
    initializeTraversal,
    nextStep: performNextStep, 
    prevStep,
    resetTraversal,
    play,
    pause,
    currentStep,
    isRunning,
    isFinished,
    // history: manager.history, // For debugging
    // workStack: manager.workStack.map(n=>n.id) // For debugging
  };
};
