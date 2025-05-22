import type { Node, Edge } from 'react-flow'; // Removed Position as it's not directly used in these type defs

// More specific types for node properties can be added later
export type PropValue = string | number | boolean | Record<string, any> | Array<any> | null;

export interface FiberNodeData {
  id: string; // Should match the main node ID for React Flow
  reactType: string; // e.g., 'div', 'span', 'MyComponent', 'HostText' (using 'reactType' to avoid clash with RF 'type')
  key?: string | null;
  
  // Simplified representations for now
  stateNode?: string; // e.g., "HTMLDivElement", "MyComponent instance", "null"
  effectTag?: string[]; // e.g., ["Placement", "Update"]
  
  // Full properties for information panel (can be complex objects or JSON strings)
  memoizedProps?: Record<string, PropValue> | string;
  pendingProps?: Record<string, PropValue> | string;
  memoizedState?: Record<string, PropValue> | string;
  updateQueue?: string; // e.g., "Exists", "Empty"

  // Pointers to other FiberNode IDs (React Flow will use these to create edges)
  childId?: string | null;
  siblingId?: string | null;
  returnId?: string | null;
  alternateId?: string | null;

  // For display on the node itself
  displayName: string; // e.g., "div", "MyComponent", "Counter (key: 'myKey')"

  // React Flow specific properties that might be part of data if not using custom node rendering
  // sourcePosition and targetPosition are typically handled by custom nodes or Handle components
  // For simplicity, if we need to control this from data, they could be here.
  // However, the main task description listed these as direct properties of FiberNodeData,
  // which is unusual for React Flow, but I will follow the primary spec.
  sourcePosition?: 'top' | 'bottom' | 'left' | 'right';
  targetPosition?: 'top' | 'bottom' | 'left' | 'right';
  customLabel?: string; // Optional, for displaying type and key directly on node (already covered by displayName?)
}

// React Flow Node type using our FiberNodeData
// We can also define different types for custom nodes if needed, e.g., 'fiberCustomNode'
export type FiberRFNode = Node<FiberNodeData>; 

// Special type for root node if needed, though often not necessary unless 'type' field is different
// export type FiberRFRootNode = Node<FiberNodeData, 'root'>; // The spec used 'root' as a type string.

// React Flow Edge type (can be used directly or extended)
// We might add custom data to edges later for styling or information
export type FiberRFEdge = Edge;

// Example of how a raw Fiber-like structure might look from user input
// This is for reference, not directly used by React Flow unless processed
export interface RawFiberNode {
  id: string; // Unique ID for this node
  type: string; // e.g., 'div', 'MyComponent' - this will map to FiberNodeData.reactType
  key?: string | null;
  props?: Record<string, any>;
  children?: RawFiberNode[]; // For hierarchical input, will be processed into child/sibling/return IDs

  // Optional direct links if input is already processed
  child?: string; // ID of child - maps to childId
  sibling?: string; // ID of sibling - maps to siblingId
  return?: string; // ID of parent - maps to returnId

  // Other Fiber properties
  effectTag?: string[];
  // ... other properties that would map to FiberNodeData
}
