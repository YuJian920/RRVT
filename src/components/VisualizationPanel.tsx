import React, { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  useOnSelectionChange,
  MarkerType, // For edge arrowheads
} from 'react-flow';
import 'reactflow/dist/style.css';

import { FiberRFNode, FiberRFEdge, FiberNodeData } from '@/types/fiber';
import { TraversalStep } from '@/hooks/useFiberTraversal';
import FiberNode from './FiberNode'; // FiberNode itself will determine its styling based on currentTraversalStep and its own ID

interface VisualizationPanelProps {
  initialNodes: FiberRFNode[];
  initialEdges: FiberRFEdge[];
  setSelectedNodeData: (nodeData: FiberNodeData | null) => void;
  currentTraversalStep: TraversalStep | null;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  initialNodes,
  initialEdges,
  setSelectedNodeData,
  currentTraversalStep,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<FiberRFNode[]>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FiberRFEdge[]>(initialEdges);

  // Update nodes and edges when initial props change (e.g. new tree data from App.tsx)
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);


  useOnSelectionChange({
    onChange: ({ nodes: selectedNodesFromHook }) => {
      if (selectedNodesFromHook.length === 1 && selectedNodesFromHook[0]) {
        const selectedFiberNode = selectedNodesFromHook[0] as FiberRFNode;
        if (selectedFiberNode.data) {
          setSelectedNodeData(selectedFiberNode.data);
        } else {
          setSelectedNodeData(null);
        }
      } else {
        setSelectedNodeData(null);
      }
    },
  });

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Pass currentTraversalStep to each FiberNode via nodeTypes
  const nodeTypes = useMemo(() => ({
    fiberNode: (props: React.ComponentProps<typeof FiberNode>) => ( 
      <FiberNode
        {...props} // props already includes id, data, selected, etc.
        currentTraversalStep={currentTraversalStep}
      />
    ),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [currentTraversalStep]); // Re-memoize if currentTraversalStep changes

  // Augment edges for highlighting based on currentTraversalStep
  const augmentedEdges = useMemo(() => {
    return edges.map(edge => {
      let isActive = false;
      let edgeStroke = edge.style?.stroke || '#b1b1b7'; // Default React Flow edge color
      const defaultStrokeWidth = 1.5;
      let edgeStrokeWidth = defaultStrokeWidth;

      if (currentTraversalStep) {
        const { processedNodeId, targetNodeId, edgeType, action } = currentTraversalStep;
        
        // Highlight edge if it's the one being traversed
        // processedNodeId is the source of the action for VISIT steps
        if (edge.source === processedNodeId && edge.target === targetNodeId) {
            if (action === 'VISIT_CHILD' && edgeType === 'child') isActive = true;
            else if (action === 'VISIT_SIBLING' && edgeType === 'sibling') isActive = true;
            else if (action === 'RETURN_TO_PARENT' && edgeType === 'return') isActive = true;
        }
      }
      
      if (isActive) {
        edgeStroke = '#ff0072'; // Active traversal edge color (pinkish-red)
        edgeStrokeWidth = 2.5;
      } else if (edge.label === 'return') { // Keep return edges styled if not active
        edgeStroke = edge.style?.stroke || '#ff5722'; // Default return edge color (orange-red)
      }


      return {
        ...edge,
        animated: isActive,
        style: { ...edge.style, stroke: edgeStroke, strokeWidth: edgeStrokeWidth },
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeStroke, width: 20, height: 20 },
      };
    });
  }, [edges, currentTraversalStep]);


  return (
    <div style={{ width: '100%', height: '100%' }} className="bg-gray-200 dark:bg-gray-700">
      <ReactFlow
        nodes={nodes}
        edges={augmentedEdges} // Use augmented edges
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        defaultEdgeOptions={{ // Default style for edges not specifically styled by augmentation
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
            style: { strokeWidth: 1.5 }
        }}
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} nodeColor={(n) => {
            if (n.type === 'fiberNode' && n.data) { // Check n.data exists
                const fiberData = n.data as FiberNodeData; // Cast necessary
                if (['div', 'span', 'p', 'h1', 'h2', 'ul', 'li', 'button'].includes(fiberData.reactType.toLowerCase())) return '#3b82f6'; // sky-500
                if (fiberData.reactType === 'HostText') return '#94a3b8'; // slate-400
                if (fiberData.reactType.charAt(0) === fiberData.reactType.charAt(0).toUpperCase() && fiberData.reactType !== 'HostText') return '#10b981'; // emerald-500
            }
            return '#a855f7'; // purple-500 (default)
        }} />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default VisualizationPanel;
