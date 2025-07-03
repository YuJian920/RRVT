import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Download } from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import { sampleTreeNames, getTreeJSON, sampleTrees } from '../utils/sampleTrees';
import type { FiberTree } from '../types/fiber';

interface InputPanelProps {
  onTreeLoad: (tree: FiberTree) => void;
  currentTree: FiberTree | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({
  onTreeLoad,
  currentTree,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [selectedExample, setSelectedExample] = useState<string>('simple');
  const [jsonContent, setJsonContent] = useState<string>(
    getTreeJSON('simple')
  );
  const [jsonError, setJsonError] = useState<string>('');

  const handleExampleChange = (exampleName: string) => {
    setSelectedExample(exampleName);
    const jsonString = getTreeJSON(exampleName);
    setJsonContent(jsonString);
    setJsonError('');
    
    const tree = sampleTrees[exampleName];
    if (tree) {
      onTreeLoad(tree);
    }
  };

  const handleJsonContentChange = (value: string | undefined) => {
    if (value === undefined) return;
    setJsonContent(value);
    
    try {
      const parsed = JSON.parse(value) as FiberTree;
      
      // Basic validation
      if (!parsed.rootId || !parsed.nodes || typeof parsed.nodes !== 'object') {
        throw new Error('Invalid tree structure: missing rootId or nodes');
      }
      
      if (!parsed.nodes[parsed.rootId]) {
        throw new Error('Root node not found in nodes object');
      }
      
      setJsonError('');
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  const handleLoadJson = () => {
    try {
      const parsed = JSON.parse(jsonContent) as FiberTree;
      
      // Validate structure
      if (!parsed.rootId || !parsed.nodes) {
        throw new Error('Invalid tree structure');
      }
      
      onTreeLoad(parsed);
      setJsonError('');
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  };

  const handleExportJson = () => {
    if (!currentTree) return;
    
    const jsonString = JSON.stringify(currentTree, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fiber-tree.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="mb-4"
        >
          <FileText className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Fiber Tree Input</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
          >
            <FileText className="w-4 h-4" />
          </Button>
        </div>

        {/* Sample Trees */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sample Trees
          </label>
          <select
            value={selectedExample}
            onChange={(e) => handleExampleChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            {sampleTreeNames.map((name) => (
              <option key={name} value={name}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-4">
          <Button
            onClick={handleLoadJson}
            disabled={!!jsonError}
            size="sm"
            className="flex items-center space-x-1"
          >
            <Upload className="w-3 h-3" />
            <span>Load</span>
          </Button>
          
          <Button
            onClick={handleExportJson}
            disabled={!currentTree}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>Export</span>
          </Button>
        </div>

        {/* Error Display */}
        {jsonError && (
          <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {jsonError}
          </div>
        )}
      </div>

      {/* JSON Editor */}
      <div className="flex-1 flex flex-col">
        <div className="p-2 bg-gray-100 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">JSON Editor</span>
        </div>
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="json"
            value={jsonContent}
            onChange={handleJsonContentChange}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 12,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Node Types</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-200 border border-orange-400 rounded"></div>
            <span>HostComponent (div, span)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-200 border border-purple-400 rounded"></div>
            <span>HostText</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded"></div>
            <span>FunctionComponent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-indigo-200 border border-indigo-400 rounded"></div>
            <span>ClassComponent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;