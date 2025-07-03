import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

import FiberNode from './FiberNode';
import ControlPanel from './ControlPanel';
import InputPanel from './InputPanel';
import InfoPanel from './InfoPanel';

import { FiberWorkLoop } from '../utils/dfsTraversal';
import { sampleTrees } from '../utils/sampleTrees';
import type { FiberTree, VisualizationState, FiberNode as FiberNodeType } from '../types/fiber';

const nodeTypes = {
  fiberNode: FiberNode,
};

const FiberVisualization: React.FC = () => {
  // State management
  const [visualizationState, setVisualizationState] = useState<VisualizationState>({
    tree: sampleTrees.simple,
    dfsState: {
      currentNodeId: null,
      visitedNodeIds: new Set(),
      stack: [],
      phase: 'idle',
      step: 0,
      totalSteps: 0,
      isRunning: false,
      isPaused: false,
      description: 'Ready to start DFS traversal',
    },
    selectedNodeId: null,
    animationSpeed: 1.0,
  });

  const [isInputPanelCollapsed, setIsInputPanelCollapsed] = useState(false);
  const [isInfoPanelCollapsed, setIsInfoPanelCollapsed] = useState(false);
  const [workLoop, setWorkLoop] = useState<FiberWorkLoop | null>(null);
  const [animationInterval, setAnimationInterval] = useState<NodeJS.Timeout | null>(null);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Initialize work loop when tree changes
  useEffect(() => {
    if (visualizationState.tree) {
      const newWorkLoop = new FiberWorkLoop(visualizationState.tree);
      setWorkLoop(newWorkLoop);
      
      setVisualizationState(prev => ({
        ...prev,
        dfsState: {
          ...newWorkLoop.getStateAtStep(-1),
          totalSteps: newWorkLoop.getSteps().length,
        },
      }));
    }
  }, [visualizationState.tree]);

  // Convert fiber tree to React Flow nodes and edges
  const convertTreeToFlowElements = useCallback((tree: FiberTree) => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    Object.values(tree.nodes).forEach((fiberNode) => {
      // Create React Flow node
      const flowNode: Node = {
        id: fiberNode.id,
        type: 'fiberNode',
        position: fiberNode.position,
        data: {
          ...fiberNode,
          isCurrentNode: visualizationState.dfsState.currentNodeId === fiberNode.id,
          isVisited: visualizationState.dfsState.visitedNodeIds.has(fiberNode.id),
          phase: visualizationState.dfsState.currentNodeId === fiberNode.id 
            ? visualizationState.dfsState.phase 
            : 'idle',
        },
        selected: visualizationState.selectedNodeId === fiberNode.id,
      };
      flowNodes.push(flowNode);

      // Create edges for relationships
      if (fiberNode.child) {
        flowEdges.push({
          id: `${fiberNode.id}-child-${fiberNode.child}`,
          source: fiberNode.id,
          target: fiberNode.child,
          type: 'default',
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          label: 'child',
          labelStyle: { fontSize: 10, fill: '#3b82f6' },
          animated: visualizationState.dfsState.currentNodeId === fiberNode.id,
        });
      }

      if (fiberNode.sibling) {
        flowEdges.push({
          id: `${fiberNode.id}-sibling-${fiberNode.sibling}`,
          source: fiberNode.id,
          target: fiberNode.sibling,
          sourceHandle: 'sibling',
          type: 'default',
          style: { stroke: '#10b981', strokeWidth: 2 },
          label: 'sibling',
          labelStyle: { fontSize: 10, fill: '#10b981' },
          animated: visualizationState.dfsState.currentNodeId === fiberNode.id,
        });
      }

      if (fiberNode.return) {
        flowEdges.push({
          id: `${fiberNode.id}-return-${fiberNode.return}`,
          source: fiberNode.id,
          target: fiberNode.return,
          type: 'default',
          style: { stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '5,5' },
          label: 'return',
          labelStyle: { fontSize: 10, fill: '#ef4444' },
        });
      }
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [visualizationState.dfsState, visualizationState.selectedNodeId]);

  // Update React Flow elements when state changes
  useEffect(() => {
    if (visualizationState.tree) {
      const { nodes: newNodes, edges: newEdges } = convertTreeToFlowElements(visualizationState.tree);
      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [visualizationState.tree, convertTreeToFlowElements, setNodes, setEdges]);

  // Animation controls
  const startAnimation = useCallback(() => {
    if (!workLoop) return;

    if (animationInterval) {
      clearInterval(animationInterval);
    }

    setVisualizationState(prev => ({
      ...prev,
      dfsState: { ...prev.dfsState, isRunning: true, isPaused: false },
    }));

    const interval = setInterval(() => {
      setVisualizationState(prev => {
        if (prev.dfsState.step >= prev.dfsState.totalSteps) {
          clearInterval(interval);
          return {
            ...prev,
            dfsState: { ...prev.dfsState, isRunning: false, isPaused: false },
          };
        }

        const newState = workLoop.getStateAtStep(prev.dfsState.step);
        return {
          ...prev,
          dfsState: { ...newState, isRunning: true, isPaused: false },
        };
      });
    }, 1000 / visualizationState.animationSpeed);

    setAnimationInterval(interval);
  }, [workLoop, animationInterval, visualizationState.animationSpeed]);

  const pauseAnimation = useCallback(() => {
    if (animationInterval) {
      clearInterval(animationInterval);
      setAnimationInterval(null);
    }
    setVisualizationState(prev => ({
      ...prev,
      dfsState: { ...prev.dfsState, isRunning: false, isPaused: true },
    }));
  }, [animationInterval]);

  const stepForward = useCallback(() => {
    if (!workLoop) return;
    
    setVisualizationState(prev => {
      if (prev.dfsState.step >= prev.dfsState.totalSteps) return prev;
      
      const newState = workLoop.getStateAtStep(prev.dfsState.step);
      return {
        ...prev,
        dfsState: { ...newState, isRunning: false, isPaused: false },
      };
    });
  }, [workLoop]);

  const stepBackward = useCallback(() => {
    if (!workLoop) return;
    
    setVisualizationState(prev => {
      if (prev.dfsState.step <= 0) return prev;
      
      const newState = workLoop.getStateAtStep(prev.dfsState.step - 2);
      return {
        ...prev,
        dfsState: { ...newState, isRunning: false, isPaused: false },
      };
    });
  }, [workLoop]);

  const resetVisualization = useCallback(() => {
    if (animationInterval) {
      clearInterval(animationInterval);
      setAnimationInterval(null);
    }
    
    if (workLoop) {
      const initialState = workLoop.getStateAtStep(-1);
      setVisualizationState(prev => ({
        ...prev,
        dfsState: { ...initialState, totalSteps: prev.dfsState.totalSteps },
      }));
    }
  }, [animationInterval, workLoop]);

  const handleTreeLoad = useCallback((tree: FiberTree) => {
    if (animationInterval) {
      clearInterval(animationInterval);
      setAnimationInterval(null);
    }
    
    setVisualizationState(prev => ({
      ...prev,
      tree,
      selectedNodeId: null,
    }));
  }, [animationInterval]);

  const handleSpeedChange = useCallback((speed: number) => {
    setVisualizationState(prev => ({ ...prev, animationSpeed: speed }));
  }, []);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setVisualizationState(prev => ({
      ...prev,
      selectedNodeId: node.id,
    }));
  }, []);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [animationInterval]);

  const selectedNode = useMemo(() => {
    if (!visualizationState.tree || !visualizationState.selectedNodeId) return null;
    return visualizationState.tree.nodes[visualizationState.selectedNodeId] || null;
  }, [visualizationState.tree, visualizationState.selectedNodeId]);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Control Panel */}
      <ControlPanel
        dfsState={visualizationState.dfsState}
        onPlay={startAnimation}
        onPause={pauseAnimation}
        onStepForward={stepForward}
        onStepBackward={stepBackward}
        onReset={resetVisualization}
        animationSpeed={visualizationState.animationSpeed}
        onSpeedChange={handleSpeedChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Input Panel */}
        <InputPanel
          onTreeLoad={handleTreeLoad}
          currentTree={visualizationState.tree}
          isCollapsed={isInputPanelCollapsed}
          onToggleCollapse={() => setIsInputPanelCollapsed(!isInputPanelCollapsed)}
        />

        {/* Visualization Area */}
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-50"
            >
              <Background />
              <Controls />
              <MiniMap 
                nodeColor={(node) => {
                  const data = node.data as any;
                  if (data.isCurrentNode) return '#3b82f6';
                  if (data.isVisited) return '#9ca3af';
                  return '#e5e7eb';
                }}
                className="bg-white"
              />
              
              {/* Legend Panel */}
              <Panel position="top-right" className="bg-white p-3 rounded shadow">
                <h4 className="text-sm font-semibold mb-2">Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Current (Begin)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Current (Complete)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-300 rounded"></div>
                    <span>Visited</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border border-blue-400 bg-blue-200 rounded"></div>
                    <span>Unvisited</span>
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {/* Information Panel */}
      <InfoPanel
        selectedNode={selectedNode}
        dfsState={visualizationState.dfsState}
        isCollapsed={isInfoPanelCollapsed}
        onToggleCollapse={() => setIsInfoPanelCollapsed(!isInfoPanelCollapsed)}
      />
    </div>
  );
};

export default FiberVisualization;