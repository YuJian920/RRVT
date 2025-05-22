import React, { useState, useEffect } from 'react';
import InputConfigPanel from './components/InputConfigPanel';
import ControlsPanel from './components/ControlsPanel';
import VisualizationPanel from './components/VisualizationPanel';
import InfoStatusPanel from './components/InfoStatusPanel';
import { FiberNodeData, FiberRFNode, FiberRFEdge } from './types/fiber';
import { useFiberTraversal } from './hooks/useFiberTraversal';

const staticInitialNodes: FiberRFNode[] = [
  {
    id: 'root', type: 'fiberNode',
    data: { id: 'root', reactType: 'div', displayName: 'div (root)', childId: 'child1', key: 'rootKey' },
    position: { x: 250, y: 5 },
  },
  {
    id: 'child1', type: 'fiberNode',
    data: { id: 'child1', reactType: 'h1', displayName: 'h1 (child1)', returnId: 'root', key: 'titleKey' },
    position: { x: 250, y: 150 },
  },
];

const staticInitialEdges: FiberRFEdge[] = [
  { id: 'e-root-child1', source: 'root', target: 'child1', label: 'child', sourceHandle: 'child', targetHandle: 'child_target' },
  { id: 'e-child1-root-return', source: 'child1', target: 'root', label: 'return', sourceHandle: 'return_source', targetHandle: 'return_target', style: { stroke: '#ff5722', strokeDasharray: '5,5' }, animated: false },
];
const staticRootId = 'root';

function App() {
  const [selectedNodeData, setSelectedNodeData] = useState<FiberNodeData | null>(null);
  const [rfNodes, setRfNodes] = useState<FiberRFNode[]>(staticInitialNodes);
  const [rfEdges, setRfEdges] = useState<FiberRFEdge[]>(staticInitialEdges);
  const [currentRootId, setCurrentRootId] = useState<string | null>(staticRootId);
  const [animationSpeed, setAnimationSpeed] = useState(1);

  const traversal = useFiberTraversal(animationSpeed);

  useEffect(() => {
    if (rfNodes.length > 0 && currentRootId) {
      traversal.initializeTraversal(rfNodes, currentRootId);
    } else {
      traversal.initializeTraversal([], null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rfNodes, currentRootId]); 

  const handleTreeDataChange = (newNodes: FiberRFNode[], newEdges: FiberRFEdge[], newRootId: string | null) => {
    setRfNodes(newNodes);
    setRfEdges(newEdges);
    setCurrentRootId(newRootId);
  };

  const initialJsonForInputPanel = staticInitialNodes.length > 0 && staticInitialNodes[0].data 
    ? JSON.stringify(staticInitialNodes[0].data, null, 2) 
    : "{}";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="w-full md:w-80 bg-gray-50 dark:bg-gray-800 md:order-1 order-2 md:h-full h-auto overflow-y-auto border-r dark:border-gray-700">
        <InputConfigPanel 
          onTreeDataChange={handleTreeDataChange}
          initialJson={initialJsonForInputPanel} 
        />
      </div>

      <div className="flex flex-col flex-1 md:order-2 order-1 md:h-full h-auto">
        <div className="bg-gray-50 dark:bg-gray-800 h-20 shadow-sm">
          <ControlsPanel
            play={traversal.play}
            pause={traversal.pause}
            nextStep={traversal.nextStep}
            prevStep={traversal.prevStep}
            reset={traversal.resetTraversal}
            isRunning={traversal.isRunning}
            isFinished={traversal.isFinished}
            animationSpeed={animationSpeed}
            setAnimationSpeed={setAnimationSpeed}
            currentIndex={traversal.currentIndex} // Pass currentIndex
          />
        </div>

        <div className="flex-1 bg-white dark:bg-gray-800 p-0 overflow-auto">
          <VisualizationPanel
            key={rfNodes.map(n => n.id).join('-') + rfEdges.map(e => e.id).join('-') + currentRootId} 
            initialNodes={rfNodes} 
            initialEdges={rfEdges} 
            setSelectedNodeData={setSelectedNodeData}
            currentTraversalStep={traversal.currentStep}
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 md:h-48 h-40 overflow-y-auto border-t dark:border-gray-700">
          <InfoStatusPanel
            selectedNodeData={selectedNodeData}
            currentTraversalStep={traversal.currentStep}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
