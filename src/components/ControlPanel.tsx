import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw, StepForward, StepBack } from 'lucide-react';
import type { DFSState } from '../types/fiber';

interface ControlPanelProps {
  dfsState: DFSState;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  animationSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  dfsState,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  animationSpeed,
  onSpeedChange,
}) => {
  const canStepForward = dfsState.step < dfsState.totalSteps;
  const canStepBackward = dfsState.step > 0;
  const isCompleted = dfsState.step >= dfsState.totalSteps;

  return (
    <div className="flex items-center justify-between w-full bg-gray-100 border-b border-gray-200 p-4">
      {/* Playback Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="flex items-center space-x-1"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onStepBackward}
          disabled={!canStepBackward}
          className="flex items-center space-x-1"
        >
          <StepBack className="w-4 h-4" />
          <span>Step Back</span>
        </Button>

        {dfsState.isRunning && !dfsState.isPaused ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onPause}
            className="flex items-center space-x-1"
          >
            <Pause className="w-4 h-4" />
            <span>Pause</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onPlay}
            disabled={isCompleted}
            className="flex items-center space-x-1"
          >
            <Play className="w-4 h-4" />
            <span>{isCompleted ? 'Completed' : 'Play'}</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onStepForward}
          disabled={!canStepForward}
          className="flex items-center space-x-1"
        >
          <StepForward className="w-4 h-4" />
          <span>Step Forward</span>
        </Button>
      </div>

      {/* Progress Info */}
      <div className="flex items-center space-x-4 text-sm">
        <div className="text-gray-600">
          Step {dfsState.step} of {dfsState.totalSteps}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Speed:</span>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={animationSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-gray-600 min-w-[3rem]">
            {animationSpeed}x
          </span>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center space-x-2">
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{
                width: `${dfsState.totalSteps > 0 ? (dfsState.step / dfsState.totalSteps) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {dfsState.totalSteps > 0 
              ? Math.round((dfsState.step / dfsState.totalSteps) * 100)
              : 0}%
          </span>
        </div>
      </div>

      {/* Phase Indicator */}
      <div className="flex items-center space-x-2">
        <div className="text-sm text-gray-600">Phase:</div>
        <div className={`px-2 py-1 rounded text-xs font-semibold ${
          dfsState.phase === 'begin' 
            ? 'bg-blue-100 text-blue-800'
            : dfsState.phase === 'complete'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {dfsState.phase === 'idle' ? 'Ready' : dfsState.phase.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;