import type { FiberTree } from '../types/fiber';
import { NodeType } from '../types/fiber';

export const sampleTrees: Record<string, FiberTree> = {
  simple: {
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: NodeType.HOST_COMPONENT,
        key: undefined,
        stateNode: 'div',
        memoizedProps: { className: 'app' },
        child: 'header',
        sibling: undefined,
        return: undefined,
        position: { x: 400, y: 50 }
      },
      header: {
        id: 'header',
        type: NodeType.HOST_COMPONENT,
        key: undefined,
        stateNode: 'header',
        memoizedProps: { className: 'header' },
        child: 'title',
        sibling: 'content',
        return: 'root',
        position: { x: 200, y: 150 }
      },
      title: {
        id: 'title',
        type: NodeType.HOST_TEXT,
        key: undefined,
        stateNode: 'React Fiber Visualization',
        memoizedProps: {},
        child: undefined,
        sibling: undefined,
        return: 'header',
        position: { x: 200, y: 250 }
      },
      content: {
        id: 'content',
        type: NodeType.HOST_COMPONENT,
        key: undefined,
        stateNode: 'main',
        memoizedProps: { className: 'content' },
        child: 'list',
        sibling: 'footer',
        return: 'root',
        position: { x: 400, y: 150 }
      },
      list: {
        id: 'list',
        type: NodeType.HOST_COMPONENT,
        key: undefined,
        stateNode: 'ul',
        memoizedProps: { className: 'list' },
        child: 'item1',
        sibling: undefined,
        return: 'content',
        position: { x: 400, y: 250 }
      },
      item1: {
        id: 'item1',
        type: NodeType.HOST_COMPONENT,
        key: 'item-1',
        stateNode: 'li',
        memoizedProps: { key: 'item-1' },
        child: 'text1',
        sibling: 'item2',
        return: 'list',
        position: { x: 300, y: 350 }
      },
      text1: {
        id: 'text1',
        type: NodeType.HOST_TEXT,
        key: undefined,
        stateNode: 'First Item',
        memoizedProps: {},
        child: undefined,
        sibling: undefined,
        return: 'item1',
        position: { x: 300, y: 450 }
      },
      item2: {
        id: 'item2',
        type: NodeType.HOST_COMPONENT,
        key: 'item-2',
        stateNode: 'li',
        memoizedProps: { key: 'item-2' },
        child: 'text2',
        sibling: 'item3',
        return: 'list',
        position: { x: 500, y: 350 }
      },
      text2: {
        id: 'text2',
        type: NodeType.HOST_TEXT,
        key: undefined,
        stateNode: 'Second Item',
        memoizedProps: {},
        child: undefined,
        sibling: undefined,
        return: 'item2',
        position: { x: 500, y: 450 }
      },
      item3: {
        id: 'item3',
        type: NodeType.HOST_COMPONENT,
        key: 'item-3',
        stateNode: 'li',
        memoizedProps: { key: 'item-3' },
        child: 'text3',
        sibling: undefined,
        return: 'list',
        position: { x: 700, y: 350 }
      },
      text3: {
        id: 'text3',
        type: NodeType.HOST_TEXT,
        key: undefined,
        stateNode: 'Third Item',
        memoizedProps: {},
        child: undefined,
        sibling: undefined,
        return: 'item3',
        position: { x: 700, y: 450 }
      },
      footer: {
        id: 'footer',
        type: NodeType.HOST_COMPONENT,
        key: undefined,
        stateNode: 'footer',
        memoizedProps: { className: 'footer' },
        child: 'footerText',
        sibling: undefined,
        return: 'root',
        position: { x: 600, y: 150 }
      },
      footerText: {
        id: 'footerText',
        type: NodeType.HOST_TEXT,
        key: undefined,
        stateNode: 'Footer Content',
        memoizedProps: {},
        child: undefined,
        sibling: undefined,
        return: 'footer',
        position: { x: 600, y: 250 }
      }
    }
  },

  withComponents: {
    rootId: 'app',
    nodes: {
      app: {
        id: 'app',
        type: NodeType.FUNCTION_COMPONENT,
        key: undefined,
        stateNode: null,
        memoizedProps: {},
        child: 'appDiv',
        sibling: undefined,
        return: undefined,
        position: { x: 400, y: 50 }
      },
      appDiv: {
        id: 'appDiv',
        type: NodeType.HOST_COMPONENT,
        key: undefined,
        stateNode: 'div',
        memoizedProps: { className: 'app-container' },
        child: 'userProfile',
        sibling: undefined,
        return: 'app',
        position: { x: 400, y: 150 }
      },
      userProfile: {
        id: 'userProfile',
        type: NodeType.FUNCTION_COMPONENT,
        key: undefined,
        stateNode: null,
        memoizedProps: { userId: 123 },
        child: 'profileDiv',
        sibling: 'todoList',
        return: 'appDiv',
        position: { x: 200, y: 250 }
      },
      profileDiv: {
        id: 'profileDiv',
        type: NodeType.HOST_COMPONENT,
        key: undefined,
        stateNode: 'div',
        memoizedProps: { className: 'profile' },
        child: 'avatar',
        sibling: undefined,
        return: 'userProfile',
        position: { x: 200, y: 350 }
      },
      avatar: {
        id: 'avatar',
        type: NodeType.HOST_COMPONENT,
        key: undefined,
        stateNode: 'img',
        memoizedProps: { src: 'avatar.jpg', alt: 'User Avatar' },
        child: undefined,
        sibling: 'username',
        return: 'profileDiv',
        position: { x: 100, y: 450 }
      },
      username: {
        id: 'username',
        type: NodeType.HOST_TEXT,
        key: undefined,
        stateNode: 'John Doe',
        memoizedProps: {},
        child: undefined,
        sibling: undefined,
        return: 'profileDiv',
        position: { x: 300, y: 450 }
      },
      todoList: {
        id: 'todoList',
        type: NodeType.FUNCTION_COMPONENT,
        key: undefined,
        stateNode: null,
        memoizedProps: { items: [] },
        effectTag: ['Update'],
        child: 'todoContainer',
        sibling: undefined,
        return: 'appDiv',
        position: { x: 600, y: 250 }
      },
      todoContainer: {
        id: 'todoContainer',
        type: NodeType.HOST_COMPONENT,
        key: undefined,
        stateNode: 'div',
        memoizedProps: { className: 'todo-list' },
        child: 'todoItem1',
        sibling: undefined,
        return: 'todoList',
        position: { x: 600, y: 350 }
      },
      todoItem1: {
        id: 'todoItem1',
        type: NodeType.HOST_COMPONENT,
        key: 'todo-1',
        stateNode: 'div',
        memoizedProps: { className: 'todo-item', key: 'todo-1' },
        effectTag: ['Placement'],
        child: 'todoText1',
        sibling: 'todoItem2',
        return: 'todoContainer',
        position: { x: 500, y: 450 }
      },
      todoText1: {
        id: 'todoText1',
        type: NodeType.HOST_TEXT,
        key: undefined,
        stateNode: 'Learn React Fiber',
        memoizedProps: {},
        child: undefined,
        sibling: undefined,
        return: 'todoItem1',
        position: { x: 500, y: 550 }
      },
      todoItem2: {
        id: 'todoItem2',
        type: NodeType.HOST_COMPONENT,
        key: 'todo-2',
        stateNode: 'div',
        memoizedProps: { className: 'todo-item', key: 'todo-2' },
        child: 'todoText2',
        sibling: undefined,
        return: 'todoContainer',
        position: { x: 700, y: 450 }
      },
      todoText2: {
        id: 'todoText2',
        type: NodeType.HOST_TEXT,
        key: undefined,
        stateNode: 'Build DFS Visualizer',
        memoizedProps: {},
        child: undefined,
        sibling: undefined,
        return: 'todoItem2',
        position: { x: 700, y: 550 }
      }
    }
  }
};

export const sampleTreeNames = Object.keys(sampleTrees);

export function getTreeJSON(treeName: string): string {
  const tree = sampleTrees[treeName];
  if (!tree) return '{}';
  
  return JSON.stringify(tree, null, 2);
}