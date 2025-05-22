// src/lib/example-trees.ts
export const SIMPLE_TREE_EXAMPLE = `{
  "id": "root-simple",
  "type": "div",
  "key": "appRoot",
  "props": { "className": "container" },
  "children": [
    {
      "id": "h1-title",
      "type": "h1",
      "props": { "children": "Welcome!" },
      "children": [
        { "id": "text-welcome", "type": "HostText", "props": { "text": "Welcome!" } }
      ]
    },
    {
      "id": "p-intro",
      "type": "p",
      "props": { "children": "This is a simple Fiber tree example." },
      "children": [
        { "id": "text-intro", "type": "HostText", "props": { "text": "This is a simple Fiber tree example." } }
      ]
    }
  ]
}`;

export const LIST_WITH_KEYS_EXAMPLE = `{
  "id": "root-list",
  "type": "div",
  "children": [
    {
      "id": "ul-list",
      "type": "ul",
      "props": { "className": "my-list" },
      "children": [
        { "id": "li-1", "type": "li", "key": "item1", "props": { "children": "List Item 1 (keyed)" }, "children": [{ "id": "text-li1", "type": "HostText", "props": { "text": "List Item 1 (keyed)" } } ] },
        { "id": "li-2", "type": "li", "props": { "children": "List Item 2 (no key)" }, "children": [{ "id": "text-li2", "type": "HostText", "props": { "text": "List Item 2 (no key)" } } ] },
        { "id": "li-3", "type": "li", "key": "item3", "props": { "children": "List Item 3 (keyed)" }, "children": [{ "id": "text-li3", "type": "HostText", "props": { "text": "List Item 3 (keyed)" } } ] }
      ]
    }
  ]
}`;

export const COMPONENT_TREE_EXAMPLE = `{
  "id": "app-comp",
  "type": "AppContainer",
  "props": {},
  "children": [
    { 
      "id": "header-comp", 
      "type": "Header", 
      "props": { "title": "My App" },
      "children": [
        { "id": "title-text", "type": "HostText", "props": { "text": "My App" } }
      ] 
    },
    { 
      "id": "user-profile-comp", 
      "type": "UserProfile", 
      "key": "user123",
      "props": { "userId": "123" },
      "children": [
        { "id": "user-div", "type": "div", "children": [
          { "id": "user-text", "type": "HostText", "props": { "text": "User Profile for 123" } }
        ]}
      ]
    }
  ]
}`;

export const NESTED_STRUCTURE_EXAMPLE = `{
  "id": "root-nested", "type": "div", "props": {"style": {"padding": "10px", "border": "1px solid black"}}, "children": [
    {"id": "child-A", "type": "section", "key": "A", "props": {"style": {"margin": "5px", "border": "1px solid blue"}}, "children": [
      {"id": "grandchild-A1", "type": "p", "props": {"text": "A1 Text"}, "children": [{"id":"text-A1", "type":"HostText", "props":{"text":"A1 Text"}}]},
      {"id": "grandchild-A2", "type": "div", "props": {"style": {"margin": "5px", "border": "1px solid green;"}}, "children": [
        {"id": "greatgrandchild-A2i", "type": "span", "props": {"text": "A2i Span"}, "children": [{"id":"text-A2i", "type":"HostText", "props":{"text":"A2i Span"}}]}
      ]}
    ]},
    {"id": "child-B", "type": "article", "key": "B", "props": {"text": "B Article"}, "children": [{"id":"text-B", "type":"HostText", "props":{"text":"B Article"}}]}
  ]
}`;

export const PREDEFINED_EXAMPLES = [
  { id: 'simple', name: 'Simple Tree', jsonData: SIMPLE_TREE_EXAMPLE },
  { id: 'list', name: 'List with Keys', jsonData: LIST_WITH_KEYS_EXAMPLE },
  { id: 'component', name: 'Component Tree', jsonData: COMPONENT_TREE_EXAMPLE },
  { id: 'nested', name: 'Nested Structure', jsonData: NESTED_STRUCTURE_EXAMPLE },
];
