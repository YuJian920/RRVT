import React from 'react';
import { Handle, Position, NodeProps } from 'react-flow';
import { FiberNodeData } from '@/types/fiber'; // Adjust path as needed
import { TraversalStep } from '@/hooks/useFiberTraversal'; // Adjust path
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper to get color based on type
const getNodeColor = (reactType: string): string => {
  if (['div', 'span', 'p', 'h1', 'h2', 'ul', 'li', 'button'].includes(reactType.toLowerCase())) {
    return 'bg-sky-500 hover:bg-sky-600'; // Host Component
  } else if (reactType === 'HostText') {
    return 'bg-slate-400 hover:bg-slate-500'; // Host Text
  } else if (reactType.charAt(0) === reactType.charAt(0).toUpperCase() && reactType !== 'HostText') { // Ensure HostText isn't caught here
    return 'bg-emerald-500 hover:bg-emerald-600'; // Function/Class Component (heuristic)
  }
  return 'bg-purple-500 hover:bg-purple-600'; // Default/Unknown
};

interface FiberNodeProps extends NodeProps<FiberNodeData> {
  currentTraversalStep: TraversalStep | null;
}

const FiberNode: React.FC<FiberNodeProps> = ({ data, selected, id, currentTraversalStep }) => {
  const baseColorClass = getNodeColor(data.reactType);
  
  let dynamicBorderColor = 'border-transparent border-2'; 
  let dynamicBgOpacityClass = 'opacity-100';
  let statusText = '';

  if (currentTraversalStep) {
    const { action, processedNodeId, targetNodeId, stack } = currentTraversalStep;

    if (processedNodeId === id && action === 'BEGIN_WORK') {
      dynamicBorderColor = 'border-green-400 border-3 shadow-green-500/50 shadow-lg ring-2 ring-green-300 ring-offset-1';
      statusText = 'Processing...';
    } 
    else if (processedNodeId === id && action === 'COMPLETE_WORK') {
      dynamicBorderColor = 'border-blue-400 border-3 shadow-blue-500/50 shadow-lg ring-2 ring-blue-300 ring-offset-1';
      statusText = 'Completed';
      dynamicBgOpacityClass = 'opacity-70';
    }
    else if (targetNodeId === id && 
             (action === 'VISIT_CHILD' || action === 'VISIT_SIBLING' || action === 'RETURN_TO_PARENT')) {
      dynamicBorderColor = 'border-pink-400 border-3 shadow-pink-500/50 shadow-lg ring-2 ring-pink-300 ring-offset-1';
    }

    if (statusText !== 'Completed') {
        if (stack.includes(id)) {
            if (processedNodeId !== id && targetNodeId !== id) { 
                dynamicBgOpacityClass = 'opacity-85';
            }
        } else { 
            dynamicBgOpacityClass = 'opacity-50';
        }
    }
  }
  
  if (selected && (dynamicBorderColor === 'border-transparent border-2' || dynamicBorderColor === '')) {
    dynamicBorderColor = 'border-yellow-400 border-2';
  }

  const tooltipContent = (
    <div className="text-xs p-1 space-y-0.5">
      <div><strong>ID:</strong> {data.id}</div>
      <div><strong>Type:</strong> {data.reactType}</div>
      {data.key && <div><strong>Key:</strong> {data.key}</div>}
      <hr className="my-1 border-gray-600" />
      <div><strong>Child:</strong> {data.childId || 'N/A'}</div>
      <div><strong>Sibling:</strong> {data.siblingId || 'N/A'}</div>
      <div><strong>Return:</strong> {data.returnId || 'N/A'}</div>
      {/* <div><strong>Props:</strong> {data.memoizedProps ? Object.keys(data.memoizedProps).length : 0} keys</div> */}
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`nodrag cursor-pointer ${baseColorClass} ${dynamicBgOpacityClass} text-white rounded-lg shadow-md text-xs ${dynamicBorderColor} transition-all duration-150 ease-in-out`}
            style={{ minWidth: '100px', padding: '8px' }}
          >
            <Handle type="target" position={Position.Top} id="child_target" className="!bg-teal-500 w-2 h-2" />
            <Handle type="target" position={Position.Left} id="sibling_target" className="!bg-pink-500 w-2 h-2" />
            <Handle type="target" position={Position.Top} id="return_target" className="!bg-orange-500 w-2 h-2 !-ml-2" />

            <div className="font-semibold truncate">{data.displayName}</div>
            {data.key && <div className="text-gray-200 text-xxs truncate">(key: {data.key})</div>}
            {statusText && <div className={`text-xxs ${
              statusText === 'Processing...' ? 'text-green-200 animate-pulse' : 
              statusText === 'Completed' ? 'text-blue-200' : 
              'text-gray-100'
            }`}>{statusText}</div>}
            
            <Handle type="source" position={Position.Bottom} id="child" className="!bg-teal-500 w-2 h-2" />
            <Handle type="source" position={Position.Right} id="sibling" className="!bg-pink-500 w-2 h-2" />
            <Handle type="source" position={Position.Bottom} id="return_source" className="!bg-orange-500 w-2 h-2 !ml-2" />
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          align="center" 
          className="bg-gray-800 text-white border-gray-700 shadow-xl z-50" // Added z-50
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default React.memo(FiberNode);
