import React from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';

interface ControlsPanelProps {
  play: () => void;
  pause: () => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  isRunning: boolean;
  isFinished: boolean;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  currentIndex: number; // Added currentIndex
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  play,
  pause,
  nextStep,
  prevStep,
  reset,
  isRunning,
  isFinished,
  animationSpeed,
  setAnimationSpeed,
  currentIndex, // Use currentIndex
}) => {

  const handlePlayPause = () => {
    if (isRunning) {
      pause();
    } else {
      play();
    }
  };

  const handleSpeedChange = (value: number[]) => {
    setAnimationSpeed(value[0]);
  };

  return (
    <div className="flex items-center justify-between p-4 h-full border-b dark:border-gray-700">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePlayPause} 
          title={isRunning ? "Pause" : "Play"} 
          disabled={isFinished && !isRunning ? false : (isRunning || isFinished)} // Play disabled if running or finished. If finished & not running, allow play (which means reset then play)
        >
          {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={prevStep} 
          title="Step Backward" 
          disabled={isRunning || currentIndex === 0} // Disabled if running or at the start
        >
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextStep} 
          title="Step Forward" 
          disabled={isRunning || isFinished} // Disabled if running or finished
        >
          <SkipForward className="h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={reset} 
          title="Reset"
          // Reset is always enabled unless we want to disable it during active processing of a step
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex items-center space-x-3 w-1/3 max-w-xs">
        <Label htmlFor="speed-slider" className="whitespace-nowrap">Speed:</Label>
        <Slider
          id="speed-slider"
          min={0.25} // Adjusted min for slower useful speeds
          max={4}   // Adjusted max for faster useful speeds
          step={0.25}
          value={[animationSpeed]}
          onValueChange={handleSpeedChange}
          className="w-full"
          disabled={isRunning} // Disable speed changes while running for simplicity
        />
        <span className="text-sm w-12 text-right">{animationSpeed.toFixed(2)}x</span> 
      </div>
    </div>
  );
};

export default ControlsPanel;
