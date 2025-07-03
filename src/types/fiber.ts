export interface FiberNodeData {
  id: string;
  type: string;
  key?: string;
  stateNode?: any;
  effectTag?: string[];
  memoizedProps?: Record<string, any>;
  pendingProps?: Record<string, any>;
  memoizedState?: any;
  updateQueue?: any;
  child?: string; // ID reference to child node
  sibling?: string; // ID reference to sibling node
  return?: string; // ID reference to parent node
  alternate?: string; // ID reference to alternate fiber
}

export interface FiberNode extends FiberNodeData {
  position: { x: number; y: number };
}

export interface FiberTree {
  nodes: Record<string, FiberNode>;
  rootId: string;
}

export interface DFSState {
  currentNodeId: string | null;
  visitedNodeIds: Set<string>;
  stack: string[];
  phase: 'begin' | 'complete' | 'idle';
  step: number;
  totalSteps: number;
  isRunning: boolean;
  isPaused: boolean;
  description: string;
}

export interface VisualizationState {
  tree: FiberTree | null;
  dfsState: DFSState;
  selectedNodeId: string | null;
  animationSpeed: number; // steps per second
}

export const NodeType = {
  HOST_COMPONENT: 'HostComponent', // div, span, etc.
  HOST_TEXT: 'HostText',
  FUNCTION_COMPONENT: 'FunctionComponent',
  CLASS_COMPONENT: 'ClassComponent',
  FRAGMENT: 'Fragment',
  SUSPENSE: 'Suspense',
  PROFILER: 'Profiler',
} as const;

export type NodeTypeValue = typeof NodeType[keyof typeof NodeType];

export const EffectTag = {
  PLACEMENT: 'Placement',
  UPDATE: 'Update',
  DELETION: 'Deletion',
  CALLBACK: 'Callback',
  REF: 'Ref',
  SNAPSHOT: 'Snapshot',
} as const;

export type EffectTagValue = typeof EffectTag[keyof typeof EffectTag];