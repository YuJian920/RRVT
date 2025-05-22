import React, { useState, useEffect, useCallback } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { processFiberJson } from '@/lib/tree-processor';
import { FiberRFNode, FiberRFEdge } from '@/types/fiber';
import { PREDEFINED_EXAMPLES } from '@/lib/example-trees'; 
import { Loader2 } from 'lucide-react'; // For loading indicator

interface InputConfigPanelProps {
  onTreeDataChange: (nodes: FiberRFNode[], edges: FiberRFEdge[], rootId: string | null) => void;
  initialJson?: string; 
}

const InputConfigPanel: React.FC<InputConfigPanelProps> = ({ onTreeDataChange, initialJson }) => {
  const defaultExample = PREDEFINED_EXAMPLES[0];
  const [jsonInput, setJsonInput] = useState(initialJson || defaultExample.jsonData);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state for processing

  const [showReturnPointers, setShowReturnPointers] = useState(true); 
  const [showSiblingPointers, setShowSiblingPointers] = useState(true); 
  const [selectedExample, setSelectedExample] = useState<string | undefined>(defaultExample.id);

  const handleJsonInputChange = (code: string) => {
    setJsonInput(code);
    setProcessingError(null); // Clear processing error when user types
    try {
      JSON.parse(code);
      setJsonError(null); 
    } catch (e: any) {
      setJsonError(e.message || "Invalid JSON syntax");
    }
  };
  
  useEffect(() => {
    const initialCode = initialJson || defaultExample.jsonData;
    setJsonInput(initialCode);
    try {
        JSON.parse(initialCode);
        setJsonError(null);
    } catch (e: any) {
        setJsonError(e.message || "Initial JSON is invalid");
    }
    const matchingExample = PREDEFINED_EXAMPLES.find(ex => ex.jsonData === initialCode);
    setSelectedExample(matchingExample ? matchingExample.id : defaultExample.id);
  }, [initialJson, defaultExample.jsonData, defaultExample.id]);

  const triggerVisualization = useCallback(async (jsonDataToVisualize: string) => {
    setProcessingError(null);
    setJsonError(null); // Clear syntax error if we are trying to visualize (e.g. from example)
    setIsLoading(true);
    try {
      // Simulate processing delay for large files if needed: await new Promise(res => setTimeout(res, 500));
      JSON.parse(jsonDataToVisualize); // Final syntax check
      const { nodes, edges, rootId } = processFiberJson(jsonDataToVisualize);
      onTreeDataChange(nodes, edges, rootId);
    } catch (e: any) {
      console.error("Error processing JSON for visualization:", e);
      if (e instanceof SyntaxError) {
          setJsonError(e.message || "Invalid JSON syntax during visualization attempt.");
      } else { 
          setProcessingError(e.message || "Failed to process JSON input for visualization.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [onTreeDataChange]);

  const handleManualVisualizeClick = () => {
    if (jsonError) {
      setProcessingError("Cannot visualize: Current JSON input is invalid.");
      return;
    }
    triggerVisualization(jsonInput);
  }

  const handleExampleChange = (exampleId: string) => {
    setSelectedExample(exampleId);
    const example = PREDEFINED_EXAMPLES.find(ex => ex.id === exampleId);
    if (example) {
      setJsonInput(example.jsonData);
      setJsonError(null); 
      setProcessingError(null); 
      triggerVisualization(example.jsonData); 
    }
  };
  
   useEffect(() => {
    const exampleToLoad = PREDEFINED_EXAMPLES.find(ex => ex.id === selectedExample);
    if (exampleToLoad) {
        triggerVisualization(exampleToLoad.jsonData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount for the default selected example

  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto">
      <div>
        <Label htmlFor="json-editor" className="text-lg font-semibold mb-2 block">Fiber Tree JSON Input</Label>
        <div className={`border rounded-md bg-white dark:bg-gray-800 shadow-sm ${jsonError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
          <Editor
            id="json-editor"
            value={jsonInput}
            onValueChange={handleJsonInputChange}
            highlight={code => highlight(code, languages.json, 'json')}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 14,
              minHeight: '200px',
              maxHeight: '400px',
              overflowY: 'auto',
            }}
            className="w-full"
            disabled={isLoading}
          />
        </div>
        {jsonError && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-md border border-red-300 dark:border-red-700">
            <p className="font-semibold">JSON Syntax Error:</p>
            <pre className="whitespace-pre-wrap">{jsonError}</pre>
          </div>
        )}
        {processingError && !jsonError && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-md border border-red-300 dark:border-red-700">
                <p className="font-semibold">Processing Error:</p>
                <pre className="whitespace-pre-wrap">{processingError}</pre>
            </div>
        )}
        <Button onClick={handleManualVisualizeClick} className="mt-3 w-full" disabled={!!jsonError || isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Processing...' : 'Visualize Tree'}
        </Button>
      </div>

      <div>
        <Label htmlFor="example-select" className="text-lg font-semibold mb-2 block">Load Example</Label>
        <Select onValueChange={handleExampleChange} value={selectedExample} disabled={isLoading}>
          <SelectTrigger id="example-select" className="w-full">
            <SelectValue placeholder="Select an example" />
          </SelectTrigger>
          <SelectContent>
            {PREDEFINED_EXAMPLES.map(ex => (
              <SelectItem key={ex.id} value={ex.id}>
                {ex.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Visualization Settings (Future)</h3>
        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm opacity-50">
          <Label htmlFor="show-return" className="font-medium">Show 'return' pointers</Label>
          <Toggle id="show-return" pressed={showReturnPointers} onPressedChange={setShowReturnPointers} aria-label="Toggle return pointers" disabled />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm opacity-50">
          <Label htmlFor="show-sibling" className="font-medium">Show 'sibling' pointers</Label>
          <Toggle id="show-sibling" pressed={showSiblingPointers} onPressedChange={setShowSiblingPointers} aria-label="Toggle sibling pointers" disabled />
        </div>
      </div>
    </div>
  );
};

export default InputConfigPanel;
