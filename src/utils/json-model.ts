import type { JsonValue, JsonNode, JsonPath, JsonObject, JsonArray } from '../types'

let nodeIdCounter = 0

function generateNodeId(): string {
  return `node_${++nodeIdCounter}`
}

export function getValueType(value: JsonValue): JsonNode['type'] {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value as JsonNode['type']
}

export function createJsonNode(
  value: JsonValue,
  key: string | number = 'root',
  path: JsonPath = [],
  parent?: JsonNode
): JsonNode {
  const node: JsonNode = {
    id: generateNodeId(),
    path: [...path],
    key,
    value,
    type: getValueType(value),
    parent,
    isCollapsed: false,
    isEditable: true
  }

  if (node.type === 'object' && value && typeof value === 'object') {
    node.children = Object.entries(value as JsonObject).map(([k, v]) =>
      createJsonNode(v, k, [...path, k], node)
    )
  } else if (node.type === 'array' && Array.isArray(value)) {
    node.children = (value as JsonArray).map((v, i) =>
      createJsonNode(v, i, [...path, i], node)
    )
  }

  return node
}

export function parseJsonToTree(json: JsonValue): JsonNode {
  nodeIdCounter = 0
  return createJsonNode(json)
}

export function findNodeByPath(root: JsonNode, path: JsonPath): JsonNode | null {
  if (path.length === 0) return root

  let current = root
  for (const segment of path) {
    if (!current.children) return null
    const child = current.children.find(c => c.key === segment)
    if (!child) return null
    current = child
  }
  return current
}

function deepCloneNode(node: JsonNode): JsonNode {
  // Deep clone the value to prevent shared references
  let clonedValue = node.value
  if (node.value !== null && typeof node.value === 'object') {
    if (Array.isArray(node.value)) {
      clonedValue = [...node.value]
    } else {
      clonedValue = { ...node.value }
    }
  }
  
  return {
    id: node.id,
    path: [...node.path],
    key: node.key,
    value: clonedValue,
    type: node.type,
    parent: undefined, // Will be set later
    children: node.children ? node.children.map(child => deepCloneNode(child)) : undefined,
    isCollapsed: node.isCollapsed,
    isEditable: node.isEditable
  }
}

function reconnectParents(node: JsonNode, parent?: JsonNode): void {
  node.parent = parent
  if (node.children) {
    for (const child of node.children) {
      reconnectParents(child, node)
    }
  }
}

export function updateNodeValue(root: JsonNode, path: JsonPath, newValue: JsonValue): JsonNode {
  const clonedRoot = deepCloneNode(root)
  reconnectParents(clonedRoot)
  
  const node = findNodeByPath(clonedRoot, path)
  
  if (!node) throw new Error(`Node not found at path: ${path.join('.')}`)
  
  node.value = newValue
  node.type = getValueType(newValue)
  
  if (node.type === 'object' && newValue && typeof newValue === 'object') {
    node.children = Object.entries(newValue as JsonObject).map(([k, v]) =>
      createJsonNode(v, k, [...path, k], node)
    )
  } else if (node.type === 'array' && Array.isArray(newValue)) {
    node.children = (newValue as JsonArray).map((v, i) =>
      createJsonNode(v, i, [...path, i], node)
    )
  } else {
    node.children = undefined
  }
  
  return clonedRoot
}

export function addNodeToObject(root: JsonNode, path: JsonPath, key: string, value: JsonValue): JsonNode {
  const clonedRoot = deepCloneNode(root)
  reconnectParents(clonedRoot)
  const parentNode = findNodeByPath(clonedRoot, path)
  
  if (!parentNode || parentNode.type !== 'object') {
    throw new Error(`Cannot add property to non-object at path: ${path.join('.')}`)
  }
  
  const newNode = createJsonNode(value, key, [...path, key], parentNode)
  
  if (!parentNode.children) {
    parentNode.children = []
  }
  parentNode.children.push(newNode)
  
  const objValue = parentNode.value as JsonObject
  objValue[key] = value
  
  return clonedRoot
}

export function removeNodeFromParent(root: JsonNode, path: JsonPath): JsonNode {
  if (path.length === 0) throw new Error('Cannot remove root node')
  
  const clonedRoot = deepCloneNode(root)
  reconnectParents(clonedRoot)
  const parentPath = path.slice(0, -1)
  const key = path[path.length - 1]
  const parentNode = findNodeByPath(clonedRoot, parentPath)
  
  if (!parentNode || !parentNode.children) {
    throw new Error(`Parent node not found at path: ${parentPath.join('.')}`)
  }
  
  parentNode.children = parentNode.children.filter(child => child.key !== key)
  
  if (parentNode.type === 'object') {
    const objValue = parentNode.value as JsonObject
    delete objValue[key as string]
  } else if (parentNode.type === 'array') {
    const arrValue = parentNode.value as JsonArray
    arrValue.splice(key as number, 1)
    
    // Rebuild children with correct indices and paths
    parentNode.children = parentNode.children.map((child, index) => {
      return {
        ...child,
        key: index,
        path: [...parentPath, index]
      }
    })
    
    // Reconnect parent relationships for updated children
    parentNode.children.forEach(child => {
      child.parent = parentNode
    })
  }
  
  return clonedRoot
}

export function treeToJson(node: JsonNode): JsonValue {
  if (node.type === 'object' && node.children) {
    const obj: JsonObject = {}
    for (const child of node.children) {
      obj[child.key as string] = treeToJson(child)
    }
    return obj
  } else if (node.type === 'array' && node.children) {
    return node.children.map(child => treeToJson(child))
  } else {
    return node.value
  }
}

export function collapseAllNodes(node: JsonNode, depth: number = 0, maxDepth: number = 1): JsonNode {
  const cloned = { ...node }
  cloned.isCollapsed = depth >= maxDepth
  
  if (cloned.children) {
    cloned.children = cloned.children.map(child => 
      collapseAllNodes(child, depth + 1, maxDepth)
    )
  }
  
  return cloned
}