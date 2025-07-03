# React FiberNode DFS Visualization Tool

A comprehensive interactive visualization tool for understanding React Fiber's depth-first search (DFS) traversal algorithm. This tool provides step-by-step animation of how React processes the virtual DOM tree using Fiber nodes.

## Features

### 🎯 Core Functionality
- **Interactive Fiber Tree Visualization**: Visual representation of React Fiber node relationships
- **DFS Traversal Animation**: Step-by-step animation showing begin/complete work phases
- **Real-time Controls**: Play, pause, step forward/backward, reset functionality
- **Speed Control**: Adjustable animation speed (0.5x to 5x)
- **Node Selection**: Click nodes to view detailed properties and relationships

### 🎨 Visual Elements
- **Color-coded Node Types**: Different colors for HostComponent, HostText, FunctionComponent, etc.
- **Phase Indicators**: Visual distinction between "begin work" and "complete work" phases
- **Effect Badges**: Visual indicators for nodes with pending effects
- **Relationship Edges**: 
  - Blue solid lines for `child` relationships
  - Green solid lines for `sibling` relationships  
  - Red dashed lines for `return` (parent) relationships

### 📊 Information Display
- **Current Step Description**: Real-time description of the current traversal action
- **DFS Stack Visualization**: Shows the current call stack during traversal
- **Node Details Panel**: Comprehensive property display for selected nodes
- **Progress Tracking**: Progress bar and step counter
- **Traversal Statistics**: Visited node count and remaining steps

### 🔧 Configuration Options
- **Sample Trees**: Pre-built examples (simple DOM tree, component tree)
- **JSON Editor**: Monaco editor for custom tree input with validation
- **Export/Import**: Save and load custom Fiber tree structures
- **Collapsible Panels**: Customizable UI layout

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation & Running
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

The application will be available at `http://localhost:5173`

## Usage Guide

### 1. Loading a Fiber Tree
- **Sample Trees**: Use the dropdown in the Input Panel to select pre-built examples
- **Custom JSON**: Edit the JSON directly in the Monaco editor
- **Validation**: Real-time JSON validation with error display

### 2. Controlling the Visualization
- **Play**: Start automatic step-by-step animation
- **Pause**: Pause the current animation
- **Step Forward/Backward**: Manual step control
- **Reset**: Return to initial state
- **Speed**: Adjust animation speed with the slider

### 3. Understanding the Visualization
- **Current Node**: Highlighted in blue (begin work) or green (complete work)
- **Visited Nodes**: Grayed out after completion
- **Active Edges**: Animated when traversing relationships
- **Effect Indicators**: Red badges on nodes with pending effects

### 4. Exploring Node Details
- Click any node to view its properties in the Information Panel
- See relationships (child, sibling, return pointers)
- View props, state, and effect tags
- Monitor the DFS stack in real-time

## Sample Tree Structure

The tool uses this JSON format for Fiber trees:

```json
{
  "rootId": "root",
  "nodes": {
    "root": {
      "id": "root",
      "type": "HostComponent",
      "stateNode": "div",
      "memoizedProps": { "className": "app" },
      "child": "header",
      "sibling": null,
      "return": null,
      "position": { "x": 400, "y": 50 }
    }
  }
}
```

### Node Properties
- **id**: Unique identifier for the node
- **type**: Node type (HostComponent, HostText, FunctionComponent, etc.)
- **stateNode**: The actual DOM element or component instance
- **memoizedProps**: The props passed to this node
- **child**: ID of the first child node
- **sibling**: ID of the next sibling node
- **return**: ID of the parent node
- **position**: { x, y } coordinates for visualization layout
- **effectTag**: Array of effect flags (optional)
- **key**: React key prop (optional)

## Understanding React Fiber DFS

### Traversal Algorithm
React Fiber uses a modified DFS traversal with two phases:

1. **Begin Work Phase**: Process the node and decide what to do with its children
2. **Complete Work Phase**: Finalize the node after all children are processed

### Traversal Order
1. Start at root
2. Try to go to `child` (depth-first)
3. If no child, try to go to `sibling`
4. If no sibling, go up via `return` and try parent's sibling
5. Repeat until all nodes are processed

### Work Loop Simulation
The tool simulates React's actual work loop algorithm:
- `workInProgress` pointer tracks the current node
- Begin work processes the node and its children
- Complete work handles effects and cleanup
- Proper sibling and return pointer navigation

## Technical Architecture

### Built With
- **React 19** + **TypeScript** - Core framework
- **React Flow** - Graph visualization and interaction
- **Framer Motion** - Smooth animations and transitions
- **Monaco Editor** - JSON editing with syntax highlighting
- **Tailwind CSS** - Styling and responsive design
- **Vite** - Build tool and development server

### Key Components
- `FiberVisualization` - Main orchestrator component
- `FiberNode` - Custom React Flow node component
- `ControlPanel` - Playback controls and progress tracking
- `InputPanel` - Tree loading and JSON editing
- `InfoPanel` - Node details and traversal state
- `DFSTraversal` / `FiberWorkLoop` - Algorithm implementations

### State Management
- Centralized visualization state with React hooks
- Immutable state updates for predictable animations
- Efficient React Flow node/edge synchronization

## Educational Value

This tool helps developers understand:
- **React Fiber Architecture**: How React organizes and processes components
- **Reconciliation Process**: The algorithm behind React updates
- **Work Loop Mechanics**: How React schedules and executes work
- **Pointer-based Tree Traversal**: Efficient tree navigation techniques
- **Begin/Complete Work Phases**: React's two-phase commit process

## Browser Compatibility
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments
- React team for the Fiber architecture
- React Flow team for the excellent graph library
- Monaco Editor team for the code editing experience
