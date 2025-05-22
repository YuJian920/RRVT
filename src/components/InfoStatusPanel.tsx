import React from 'react';
import { FiberNodeData } from '@/types/fiber'; // Adjust path
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TraversalStep } from '@/hooks/useFiberTraversal'; // Adjust path

interface InfoStatusPanelProps {
  selectedNodeData: FiberNodeData | null;
  currentTraversalStep: TraversalStep | null; // Added this prop
}

const InfoStatusPanel: React.FC<InfoStatusPanelProps> = ({ selectedNodeData, currentTraversalStep }) => {
  const renderObject = (obj: any) => {
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object' && obj !== null) {
      return JSON.stringify(obj, null, 2);
    }
    return String(obj);
  };

  return (
    <div className="p-3 h-full overflow-y-auto space-y-3 text-sm">
      {/* Selected Node Details */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-base">Selected Node Details</CardTitle>
        </CardHeader>
        <CardContent className="p-3 text-xs">
          {selectedNodeData ? (
            <div className="space-y-1.5">
              <div><strong>ID:</strong> {selectedNodeData.id}</div>
              <div><strong>Type:</strong> {selectedNodeData.reactType}</div>
              <div><strong>Display Name:</strong> {selectedNodeData.displayName}</div>
              {selectedNodeData.key && <div><strong>Key:</strong> {selectedNodeData.key}</div>}
              {selectedNodeData.stateNode && <div><strong>State Node:</strong> {selectedNodeData.stateNode}</div>}
              
              <div className="pt-1"><strong>Pointers:</strong></div>
              <div className="pl-2">
                <div>Child ID: {selectedNodeData.childId || 'null'}</div>
                <div>Sibling ID: {selectedNodeData.siblingId || 'null'}</div>
                <div>Return ID: {selectedNodeData.returnId || 'null'}</div>
                <div>Alternate ID: {selectedNodeData.alternateId || 'null'}</div>
              </div>

              {selectedNodeData.effectTag && selectedNodeData.effectTag.length > 0 && (
                <div className="pt-1"><strong>Effect Tag(s):</strong> {selectedNodeData.effectTag.join(', ')}</div>
              )}

              {selectedNodeData.memoizedProps && <div><strong>Memoized Props:</strong> <pre className="bg-gray-100 dark:bg-gray-700 p-1 rounded text-xxs overflow-x-auto">{renderObject(selectedNodeData.memoizedProps)}</pre></div>}
              {selectedNodeData.pendingProps && <div><strong>Pending Props:</strong> <pre className="bg-gray-100 dark:bg-gray-700 p-1 rounded text-xxs overflow-x-auto">{renderObject(selectedNodeData.pendingProps)}</pre></div>}
              {selectedNodeData.memoizedState && <div><strong>Memoized State:</strong> <pre className="bg-gray-100 dark:bg-gray-700 p-1 rounded text-xxs overflow-x-auto">{renderObject(selectedNodeData.memoizedState)}</pre></div>}
              {selectedNodeData.updateQueue && <div><strong>Update Queue:</strong> {selectedNodeData.updateQueue}</div>}
            </div>
          ) : (
            <p>No node selected.</p>
          )}
        </CardContent>
      </Card>

      {/* Traversal Status */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-base">Traversal Status</CardTitle>
        </CardHeader>
        <CardContent className="p-3 text-xs space-y-1">
          <div><strong>Action:</strong> {currentTraversalStep?.action || 'N/A'}</div>
          <div><strong>Message:</strong> {currentTraversalStep?.message || 'Traversal not started.'}</div>
          {currentTraversalStep?.processedNodeId && <div><strong>Processed Node:</strong> {currentTraversalStep.processedNodeId}</div>}
          {currentTraversalStep?.targetNodeId && <div><strong>Target Node:</strong> {currentTraversalStep.targetNodeId} ({currentTraversalStep.edgeType})</div>}
        </CardContent>
      </Card>

      {/* DFS Stack */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-base">DFS Stack</CardTitle>
        </CardHeader>
        <CardContent className="p-3 text-xs">
          {currentTraversalStep && currentTraversalStep.stack.length > 0 ? (
            <pre className="bg-gray-100 dark:bg-gray-700 p-1 rounded text-xxs overflow-x-auto">
              {currentTraversalStep.stack.slice().reverse().join('\n') /* Display top of stack first */}
            </pre>
          ) : (
            <p>Stack is empty.</p>
          )}
        </CardContent>
      </Card>
      
      {/* Explanatory Notes - Could be an Accordion later */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-base">Explanatory Notes</CardTitle>
        </CardHeader>
        <CardContent className="p-3 text-xs">
          <p>Context-sensitive explanations will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoStatusPanel;
