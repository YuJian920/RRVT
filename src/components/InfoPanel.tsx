import React from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FiberNode, DFSState } from '../types/fiber';

interface InfoPanelProps {
  selectedNode: FiberNode | null;
  dfsState: DFSState;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  selectedNode,
  dfsState,
  isCollapsed,
  onToggleCollapse,
}) => {
  if (isCollapsed) {
    return (
      <div className="h-12 bg-gray-50 border-t border-gray-200 flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="flex items-center space-x-1"
        >
          <ChevronUp className="w-4 h-4" />
          <span className="text-sm">Show Details</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-64 bg-gray-50 border-t border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold">Information Panel</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="flex items-center space-x-1"
        >
          <ChevronDown className="w-4 h-4" />
          <span className="text-xs">Collapse</span>
        </Button>
      </div>

      <div className="flex-1 flex">
        {/* Current Step Description */}
        <div className="flex-1 p-3 border-r border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Step</h4>
          <div className="text-sm text-gray-600 mb-3">
            {dfsState.description}
          </div>
          
          {/* DFS Stack */}
          {dfsState.stack.length > 0 && (
            <div className="mb-3">
              <h5 className="text-xs font-medium text-gray-700 mb-1">DFS Stack</h5>
              <div className="bg-gray-100 rounded p-2 max-h-20 overflow-y-auto">
                {dfsState.stack.map((nodeId, index) => (
                  <div
                    key={`${nodeId}-${index}`}
                    className="text-xs text-gray-600 font-mono"
                  >
                    {index === dfsState.stack.length - 1 ? '→ ' : '  '}
                    {nodeId}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Traversal Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium text-gray-700">Visited:</span>
              <span className="ml-1 text-gray-600">
                {dfsState.visitedNodeIds.size}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Remaining:</span>
              <span className="ml-1 text-gray-600">
                {dfsState.totalSteps - dfsState.step}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Node Details */}
        <div className="flex-1 p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {selectedNode ? 'Selected Node' : 'Node Details'}
          </h4>
          
          {selectedNode ? (
            <div className="space-y-2 text-xs">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium text-gray-700">ID:</span>
                  <span className="ml-1 text-gray-600 font-mono">
                    {selectedNode.id}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-1 text-gray-600">
                    {selectedNode.type}
                  </span>
                </div>
              </div>

              {selectedNode.key && (
                <div>
                  <span className="font-medium text-gray-700">Key:</span>
                  <span className="ml-1 text-gray-600">
                    {selectedNode.key}
                  </span>
                </div>
              )}

              {selectedNode.stateNode && (
                <div>
                  <span className="font-medium text-gray-700">State Node:</span>
                  <span className="ml-1 text-gray-600 break-all">
                    {typeof selectedNode.stateNode === 'string' 
                      ? selectedNode.stateNode 
                      : '[Object]'}
                  </span>
                </div>
              )}

              {/* Relationships */}
              <div className="border-t border-gray-200 pt-2">
                <h5 className="font-medium text-gray-700 mb-1">Relationships</h5>
                <div className="space-y-1">
                  {selectedNode.child && (
                    <div>
                      <span className="font-medium text-gray-700">Child:</span>
                      <span className="ml-1 text-gray-600 font-mono">
                        {selectedNode.child}
                      </span>
                    </div>
                  )}
                  {selectedNode.sibling && (
                    <div>
                      <span className="font-medium text-gray-700">Sibling:</span>
                      <span className="ml-1 text-gray-600 font-mono">
                        {selectedNode.sibling}
                      </span>
                    </div>
                  )}
                  {selectedNode.return && (
                    <div>
                      <span className="font-medium text-gray-700">Parent:</span>
                      <span className="ml-1 text-gray-600 font-mono">
                        {selectedNode.return}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Effects */}
              {selectedNode.effectTag && selectedNode.effectTag.length > 0 && (
                <div className="border-t border-gray-200 pt-2">
                  <h5 className="font-medium text-gray-700 mb-1">Effect Tags</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.effectTag.map((tag, index) => (
                      <span
                        key={index}
                        className="px-1 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Props Preview */}
              {selectedNode.memoizedProps && 
               Object.keys(selectedNode.memoizedProps).length > 0 && (
                <div className="border-t border-gray-200 pt-2">
                  <h5 className="font-medium text-gray-700 mb-1">Props</h5>
                  <div className="bg-gray-100 rounded p-1 max-h-16 overflow-y-auto">
                    <pre className="text-[10px] text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(selectedNode.memoizedProps, null, 1)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Click on a node to view its details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;