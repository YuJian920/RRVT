import type { FiberTree, DFSState, FiberNode } from '../types/fiber';

export interface DFSStep {
  nodeId: string;
  phase: 'begin' | 'complete';
  description: string;
  stack: string[];
  action: 'visit_child' | 'visit_sibling' | 'return_to_parent' | 'complete_node' | 'start';
}

export class DFSTraversal {
  private tree: FiberTree;
  private steps: DFSStep[] = [];
  private currentStepIndex = -1;

  constructor(tree: FiberTree) {
    this.tree = tree;
    this.generateSteps();
  }

  private generateSteps(): void {
    this.steps = [];
    const visited = new Set<string>();
    const stack: string[] = [];

    const generateStepsRecursive = (nodeId: string, phase: 'begin' | 'complete') => {
      const node = this.tree.nodes[nodeId];
      if (!node) return;

      if (phase === 'begin') {
        // Begin work phase
        stack.push(nodeId);
        this.steps.push({
          nodeId,
          phase: 'begin',
          description: `Begin work on ${this.getNodeDescription(node)}`,
          stack: [...stack],
          action: stack.length === 1 ? 'start' : 'visit_child'
        });

        // Process child first (DFS)
        if (node.child) {
          generateStepsRecursive(node.child, 'begin');
        }

        // Process siblings
        if (node.sibling) {
          generateStepsRecursive(node.sibling, 'begin');
        }

        // Complete work phase
        this.steps.push({
          nodeId,
          phase: 'complete',
          description: `Complete work on ${this.getNodeDescription(node)}`,
          stack: [...stack],
          action: 'complete_node'
        });

        visited.add(nodeId);
        stack.pop();

        // If returning to parent, add a return step
        if (node.return && stack.length > 0) {
          this.steps.push({
            nodeId: node.return,
            phase: 'begin',
            description: `Return to parent ${this.getNodeDescription(this.tree.nodes[node.return])}`,
            stack: [...stack],
            action: 'return_to_parent'
          });
        }
      }
    };

    // Start DFS from root
    generateStepsRecursive(this.tree.rootId, 'begin');
  }

  private getNodeDescription(node: FiberNode): string {
    const type = node.type;
    const key = node.key ? ` (key: "${node.key}")` : '';
    const stateNode = node.stateNode ? 
      (typeof node.stateNode === 'string' ? ` "${node.stateNode}"` : '') : '';
    return `${type}${key}${stateNode}`;
  }

  public getInitialState(): DFSState {
    return {
      currentNodeId: null,
      visitedNodeIds: new Set(),
      stack: [],
      phase: 'idle',
      step: 0,
      totalSteps: this.steps.length,
      isRunning: false,
      isPaused: false,
      description: 'Ready to start DFS traversal'
    };
  }

  public getStepByIndex(index: number): DFSStep | null {
    if (index < 0 || index >= this.steps.length) return null;
    return this.steps[index];
  }

  public getTotalSteps(): number {
    return this.steps.length;
  }

  public getStateAtStep(stepIndex: number): DFSState {
    if (stepIndex < 0) {
      return this.getInitialState();
    }

    if (stepIndex >= this.steps.length) {
      return {
        currentNodeId: null,
        visitedNodeIds: new Set(Object.keys(this.tree.nodes)),
        stack: [],
        phase: 'idle',
        step: this.steps.length,
        totalSteps: this.steps.length,
        isRunning: false,
        isPaused: false,
        description: 'DFS traversal completed'
      };
    }

    const currentStep = this.steps[stepIndex];
    const visitedNodeIds = new Set<string>();

    // Collect all nodes that have been completed up to this step
    for (let i = 0; i <= stepIndex; i++) {
      const step = this.steps[i];
      if (step.phase === 'complete') {
        visitedNodeIds.add(step.nodeId);
      }
    }

    return {
      currentNodeId: currentStep.nodeId,
      visitedNodeIds,
      stack: [...currentStep.stack],
      phase: currentStep.phase,
      step: stepIndex + 1,
      totalSteps: this.steps.length,
      isRunning: false,
      isPaused: false,
      description: currentStep.description
    };
  }

  public getAllSteps(): DFSStep[] {
    return [...this.steps];
  }
}

// Alternative simpler DFS implementation following React Fiber's actual work loop pattern
export class FiberWorkLoop {
  private tree: FiberTree;
  private steps: DFSStep[] = [];

  constructor(tree: FiberTree) {
    this.tree = tree;
    this.generateWorkLoopSteps();
  }

  private generateWorkLoopSteps(): void {
    this.steps = [];
    let workInProgressId: string | null = this.tree.rootId;
    
    // Simulate React's work loop
    while (workInProgressId) {
      const node: FiberNode | undefined = this.tree.nodes[workInProgressId];
      if (!node) break;

      // Begin work
      this.steps.push({
        nodeId: workInProgressId,
        phase: 'begin',
        description: `Begin work: Processing ${this.getNodeDescription(node)}`,
        stack: [],
        action: 'visit_child'
      });

      // Try to go down to child
      if (node.child) {
        workInProgressId = node.child;
        continue;
      }

      // No child, try to complete this node and move to sibling
      let nodeToComplete: string | null = workInProgressId;
      
      while (nodeToComplete) {
        const completingNode: FiberNode | undefined = this.tree.nodes[nodeToComplete];
        if (!completingNode) break;

        // Complete work
        this.steps.push({
          nodeId: nodeToComplete,
          phase: 'complete',
          description: `Complete work: Finished ${this.getNodeDescription(completingNode)}`,
          stack: [],
          action: 'complete_node'
        });

        // Try to move to sibling
        if (completingNode.sibling) {
          workInProgressId = completingNode.sibling;
          nodeToComplete = null; // Break out of completion loop
        } else {
          // No sibling, go up to parent
          nodeToComplete = completingNode.return ?? null;
          workInProgressId = null; // Will be set if we find a sibling
        }
      }

      // If we completed all the way to root, we're done
      if (!workInProgressId && !nodeToComplete) {
        break;
      }
    }
  }

  private getNodeDescription(node: FiberNode): string {
    const type = node.type;
    const key = node.key ? ` (key: "${node.key}")` : '';
    const stateNode = node.stateNode ? 
      (typeof node.stateNode === 'string' ? ` "${node.stateNode}"` : '') : '';
    return `${type}${key}${stateNode}`;
  }

  public getSteps(): DFSStep[] {
    return [...this.steps];
  }

  public getStateAtStep(stepIndex: number): DFSState {
    if (stepIndex < 0) {
      return {
        currentNodeId: null,
        visitedNodeIds: new Set(),
        stack: [],
        phase: 'idle',
        step: 0,
        totalSteps: this.steps.length,
        isRunning: false,
        isPaused: false,
        description: 'Ready to start Fiber work loop'
      };
    }

    if (stepIndex >= this.steps.length) {
      return {
        currentNodeId: null,
        visitedNodeIds: new Set(Object.keys(this.tree.nodes)),
        stack: [],
        phase: 'idle',
        step: this.steps.length,
        totalSteps: this.steps.length,
        isRunning: false,
        isPaused: false,
        description: 'Fiber work loop completed'
      };
    }

    const currentStep = this.steps[stepIndex];
    const visitedNodeIds = new Set<string>();

    // Collect all nodes that have been completed up to this step
    for (let i = 0; i <= stepIndex; i++) {
      const step = this.steps[i];
      if (step.phase === 'complete') {
        visitedNodeIds.add(step.nodeId);
      }
    }

    return {
      currentNodeId: currentStep.nodeId,
      visitedNodeIds,
      stack: [], // Fiber doesn't use an explicit stack in the same way
      phase: currentStep.phase,
      step: stepIndex + 1,
      totalSteps: this.steps.length,
      isRunning: false,
      isPaused: false,
      description: currentStep.description
    };
  }
}