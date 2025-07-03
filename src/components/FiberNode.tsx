import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import type { FiberNode as FiberNodeType } from '../types/fiber';
import { cn } from '@/lib/utils';

interface FiberNodeData extends FiberNodeType {
  isCurrentNode?: boolean;
  isVisited?: boolean;
  phase?: 'begin' | 'complete' | 'idle';
}

const FiberNode: React.FC<NodeProps<FiberNodeData>> = ({ data, selected }) => {
  const getNodeColor = () => {
    if (data.isCurrentNode) {
      return data.phase === 'begin' 
        ? 'bg-blue-500 border-blue-600' 
        : 'bg-green-500 border-green-600';
    }
    if (data.isVisited) {
      return 'bg-gray-300 border-gray-400';
    }
    return getTypeColor();
  };

  const getTypeColor = () => {
    switch (data.type) {
      case 'HostComponent':
        return 'bg-orange-200 border-orange-400';
      case 'HostText':
        return 'bg-purple-200 border-purple-400';
      case 'FunctionComponent':
        return 'bg-blue-200 border-blue-400';
      case 'ClassComponent':
        return 'bg-indigo-200 border-indigo-400';
      case 'Fragment':
        return 'bg-yellow-200 border-yellow-400';
      default:
        return 'bg-gray-200 border-gray-400';
    }
  };

  const getTypeIcon = () => {
    switch (data.type) {
      case 'HostComponent':
        return '🏷️';
      case 'HostText':
        return '📝';
      case 'FunctionComponent':
        return '⚡';
      case 'ClassComponent':
        return '🏗️';
      case 'Fragment':
        return '🔗';
      default:
        return '❓';
    }
  };

  const getDisplayText = () => {
    if (data.type === 'HostText' && data.stateNode) {
      return typeof data.stateNode === 'string' 
        ? data.stateNode.substring(0, 20) + (data.stateNode.length > 20 ? '...' : '')
        : 'Text';
    }
    
    if (data.stateNode && typeof data.stateNode === 'string') {
      return data.stateNode;
    }
    
    return data.type;
  };

  const hasEffects = data.effectTag && data.effectTag.length > 0;

  return (
    <>
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} id="sibling" />

      <motion.div
        className={cn(
          'px-3 py-2 border-2 rounded-lg shadow-md min-w-[120px] max-w-[200px]',
          'text-sm font-medium text-center relative',
          getNodeColor(),
          selected && 'ring-2 ring-yellow-400',
          data.isCurrentNode && 'animate-pulse'
        )}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Effect indicator */}
        {hasEffects && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">!</span>
          </div>
        )}

        {/* Type icon */}
        <div className="text-lg mb-1">
          {getTypeIcon()}
        </div>

        {/* Node type */}
        <div className="font-semibold text-xs text-gray-700 mb-1">
          {data.type}
        </div>

        {/* Display text or state node */}
        <div className="text-xs text-gray-600 mb-1 break-words">
          {getDisplayText()}
        </div>

        {/* Key if present */}
        {data.key && (
          <div className="text-[10px] text-gray-500 italic">
            key: {data.key}
          </div>
        )}

        {/* Phase indicator */}
        {data.isCurrentNode && data.phase && (
          <div className={cn(
            'absolute -bottom-2 left-1/2 transform -translate-x-1/2',
            'px-2 py-1 rounded text-[10px] font-bold',
            data.phase === 'begin' 
              ? 'bg-blue-600 text-white' 
              : 'bg-green-600 text-white'
          )}>
            {data.phase.toUpperCase()}
          </div>
        )}
      </motion.div>
    </>
  );
};

export default FiberNode;