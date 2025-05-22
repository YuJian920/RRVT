import { FiberRFNode, FiberRFEdge, FiberNodeData, RawFiberNode } from '@/types/fiber';
import dagre from 'dagre';

const NODE_WIDTH = 180; // Adjusted for potentially longer displayNames
const NODE_HEIGHT = 75; // Adjusted for status text and key

interface ProcessedTree {
  nodes: FiberRFNode[];
  edges: FiberRFEdge[];
  rootId: string | null;
}

const createDisplayName = (type: string, key?: string | null): string => {
  return `${type}${key ? ` (key: ${key})` : ''}`;
};

export const processFiberJson = (jsonString: string): ProcessedTree => {
  let rawRoot: RawFiberNode;
  try {
    const parsedJson = JSON.parse(jsonString);
    if (typeof parsedJson !== 'object' || parsedJson === null || Array.isArray(parsedJson)) {
      throw new Error("Input must be a single JSON object representing the root node.");
    }
    rawRoot = parsedJson as RawFiberNode;
  } catch (error: any) {
    console.error("JSON parsing error:", error.message);
    throw new Error(`Invalid JSON input: ${error.message}`);
  }

  if (!rawRoot || typeof rawRoot.id !== 'string' || !rawRoot.id || typeof rawRoot.type !== 'string' || !rawRoot.type) {
    throw new Error("Root node in JSON must have a valid string 'id' and 'type'.");
  }

  const rfNodes: FiberRFNode[] = [];
  const rfEdges: FiberRFEdge[] = [];
  let rootIdFromProcessing: string | null = null;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 30, ranksep: 60 }); // Slightly reduced separation
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  function buildReactFlowObjects(rawNode: RawFiberNode, parentIdInHierarchy?: string): string {
    const nodeId = rawNode.id;
    if (typeof nodeId !== 'string' || !nodeId) throw new Error(`Node missing or invalid ID: ${JSON.stringify(rawNode)}`);
    if (typeof rawNode.type !== 'string' || !rawNode.type) throw new Error(`Node ${nodeId} missing or invalid type.`);

    if (!rootIdFromProcessing) {
      rootIdFromProcessing = nodeId;
    }

    const nodeData: FiberNodeData = {
      id: nodeId,
      reactType: rawNode.type,
      key: rawNode.key,
      displayName: createDisplayName(rawNode.type, rawNode.key),
      memoizedProps: rawNode.props || {},
      returnId: parentIdInHierarchy || null,
      childId: null, // Will be set if first child exists
      siblingId: null, // Will be set by parent processing its children list
    };

    rfNodes.push({
      id: nodeId,
      type: 'fiberNode',
      data: nodeData,
      position: { x: 0, y: 0 }, // Position will be set by Dagre
    });

    dagreGraph.setNode(nodeId, { width: NODE_WIDTH, height: NODE_HEIGHT, label: nodeData.displayName });

    if (parentIdInHierarchy) {
      dagreGraph.setEdge(parentIdInHierarchy, nodeId);
    }

    let previousChildNodeId: string | null = null;
    if (rawNode.children && rawNode.children.length > 0) {
      nodeData.childId = rawNode.children[0].id; // Link first child

      rawNode.children.forEach((childRawNode) => {
        const currentChildNodeId = buildReactFlowObjects(childRawNode, nodeId);
        if (previousChildNodeId) {
          const prevNode = rfNodes.find(n => n.id === previousChildNodeId);
          if (prevNode?.data) {
            prevNode.data.siblingId = currentChildNodeId; // Link previous child to current as sibling
          }
        }
        previousChildNodeId = currentChildNodeId;
      });
    }
    return nodeId;
  }

  buildReactFlowObjects(rawRoot);
  dagre.layout(dagreGraph);

  rfNodes.forEach(node => {
    const dagreNode = dagreGraph.node(node.id);
    if (dagreNode) {
      node.position = { x: dagreNode.x - NODE_WIDTH / 2, y: dagreNode.y - NODE_HEIGHT / 2 };
    }

    // Create React Flow edges based on populated pointers
    if (node.data.childId) {
      rfEdges.push({
        id: `e-${node.id}-child-${node.data.childId}`,
        source: node.id, target: node.data.childId,
        label: 'child', sourceHandle: 'child', targetHandle: 'child_target',
      });
    }
    if (node.data.siblingId) {
      rfEdges.push({
        id: `e-${node.id}-sibling-${node.data.siblingId}`,
        source: node.id, target: node.data.siblingId,
        label: 'sibling', sourceHandle: 'sibling', targetHandle: 'sibling_target',
        style: { stroke: '#4caf50', strokeDasharray: '2,2' },
      });
    }
    if (node.data.returnId) {
      rfEdges.push({
        id: `e-${node.id}-return-${node.data.returnId}`,
        source: node.id, target: node.data.returnId,
        label: 'return', sourceHandle: 'return_source', targetHandle: 'return_target',
        style: { stroke: '#ff5722', strokeDasharray: '5,5' },
      });
    }
  });
  
  if (!rootIdFromProcessing && rfNodes.length > 0) {
    console.warn("Root ID was not explicitly set during processing, defaulting to the first node found.");
    rootIdFromProcessing = rfNodes[0].id;
  }


  return { nodes: rfNodes, edges: rfEdges, rootId: rootIdFromProcessing };
};
