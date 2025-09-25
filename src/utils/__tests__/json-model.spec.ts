import { describe, it, expect, beforeEach } from 'vitest'
import {
  parseJsonToTree,
  findNodeByPath,
  updateNodeValue,
  addNodeToObject,
  removeNodeFromParent,
  treeToJson,
  getValueType
} from '../json-model'
import type { JsonValue, JsonNode } from '../../types'

describe('json-model utilities', () => {
  const sampleJson: JsonValue = {
    name: 'John',
    age: 30,
    active: true,
    hobbies: ['reading', 'coding'],
    address: {
      street: '123 Main St',
      city: 'New York'
    },
    metadata: null
  }

  let rootNode: JsonNode

  beforeEach(() => {
    rootNode = parseJsonToTree(sampleJson)
  })

  describe('getValueType', () => {
    it('correctly identifies all JSON types', () => {
      expect(getValueType('string')).toBe('string')
      expect(getValueType(42)).toBe('number')
      expect(getValueType(true)).toBe('boolean')
      expect(getValueType(null)).toBe('null')
      expect(getValueType({})).toBe('object')
      expect(getValueType([])).toBe('array')
    })
  })

  describe('parseJsonToTree', () => {
    it('creates a proper tree structure', () => {
      expect(rootNode.type).toBe('object')
      expect(rootNode.children).toHaveLength(6)
      expect(rootNode.path).toEqual([])
      expect(rootNode.key).toBe('root')
    })

    it('assigns unique IDs to nodes', () => {
      const allNodes = getAllNodes(rootNode)
      const ids = allNodes.map(node => node.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('correctly sets parent relationships', () => {
      const addressNode = findNodeByPath(rootNode, ['address'])
      expect(addressNode?.children?.[0].parent).toBe(addressNode)
    })

    it('handles primitive values', () => {
      const stringNode = parseJsonToTree('simple string')
      expect(stringNode.type).toBe('string')
      expect(stringNode.value).toBe('simple string')
      expect(stringNode.children).toBeUndefined()
    })

    it('handles arrays correctly', () => {
      const arrayData = ['item1', 'item2', 'item3']
      const arrayNode = parseJsonToTree(arrayData)
      
      expect(arrayNode.type).toBe('array')
      expect(arrayNode.children).toHaveLength(3)
      expect(arrayNode.children?.[0].key).toBe(0)
      expect(arrayNode.children?.[1].key).toBe(1)
    })
  })

  describe('findNodeByPath', () => {
    it('finds nodes by valid paths', () => {
      const nameNode = findNodeByPath(rootNode, ['name'])
      expect(nameNode?.value).toBe('John')
      expect(nameNode?.type).toBe('string')
    })

    it('finds nested nodes', () => {
      const streetNode = findNodeByPath(rootNode, ['address', 'street'])
      expect(streetNode?.value).toBe('123 Main St')
    })

    it('finds array elements', () => {
      const firstHobby = findNodeByPath(rootNode, ['hobbies', 0])
      expect(firstHobby?.value).toBe('reading')
    })

    it('returns null for invalid paths', () => {
      expect(findNodeByPath(rootNode, ['nonexistent'])).toBe(null)
      expect(findNodeByPath(rootNode, ['address', 'nonexistent'])).toBe(null)
    })

    it('returns root for empty path', () => {
      const root = findNodeByPath(rootNode, [])
      expect(root).toBe(rootNode)
    })
  })

  describe('updateNodeValue', () => {
    it('updates primitive values', () => {
      const updatedTree = updateNodeValue(rootNode, ['name'], 'Jane')
      const nameNode = findNodeByPath(updatedTree, ['name'])
      expect(nameNode?.value).toBe('Jane')
    })

    it('updates complex values and rebuilds children', () => {
      const newAddress = { street: '456 Oak Ave', city: 'Boston', zip: '02101' }
      const updatedTree = updateNodeValue(rootNode, ['address'], newAddress)
      const addressNode = findNodeByPath(updatedTree, ['address'])
      
      expect(addressNode?.children).toHaveLength(3)
      expect(findNodeByPath(updatedTree, ['address', 'zip'])?.value).toBe('02101')
    })

    it('preserves immutability - does not modify original', () => {
      const originalName = findNodeByPath(rootNode, ['name'])?.value
      updateNodeValue(rootNode, ['name'], 'Jane')
      
      expect(findNodeByPath(rootNode, ['name'])?.value).toBe(originalName)
    })

    it('throws error for invalid paths', () => {
      expect(() => {
        updateNodeValue(rootNode, ['nonexistent'], 'value')
      }).toThrow('Node not found at path: nonexistent')
    })

    it('updates type when value type changes', () => {
      const updatedTree = updateNodeValue(rootNode, ['age'], 'thirty')
      const ageNode = findNodeByPath(updatedTree, ['age'])
      expect(ageNode?.type).toBe('string')
      expect(ageNode?.value).toBe('thirty')
    })
  })

  describe('addNodeToObject', () => {
    it('adds properties to objects', () => {
      const updatedTree = addNodeToObject(rootNode, [], 'email', 'john@example.com')
      const emailNode = findNodeByPath(updatedTree, ['email'])
      
      expect(emailNode?.value).toBe('john@example.com')
      expect(emailNode?.type).toBe('string')
    })

    it('adds nested properties', () => {
      const updatedTree = addNodeToObject(rootNode, ['address'], 'zip', '10001')
      const zipNode = findNodeByPath(updatedTree, ['address', 'zip'])
      
      expect(zipNode?.value).toBe('10001')
    })

    it('preserves existing properties', () => {
      const updatedTree = addNodeToObject(rootNode, [], 'email', 'john@example.com')
      const nameNode = findNodeByPath(updatedTree, ['name'])
      
      expect(nameNode?.value).toBe('John')
    })

    it('throws error when adding to non-objects', () => {
      expect(() => {
        addNodeToObject(rootNode, ['name'], 'invalid', 'value')
      }).toThrow('Cannot add property to non-object')
    })
  })

  describe('removeNodeFromParent', () => {
    it('removes properties from objects', () => {
      const updatedTree = removeNodeFromParent(rootNode, ['metadata'])
      const metadataNode = findNodeByPath(updatedTree, ['metadata'])
      
      expect(metadataNode).toBe(null)
    })

    it('removes elements from arrays', () => {
      const updatedTree = removeNodeFromParent(rootNode, ['hobbies', 0])
      const hobbiesNode = findNodeByPath(updatedTree, ['hobbies'])
      
      expect(hobbiesNode?.children).toHaveLength(1)
      expect(findNodeByPath(updatedTree, ['hobbies', 0])?.value).toBe('coding')
    })

    it('updates array indices after removal', () => {
      const updatedTree = removeNodeFromParent(rootNode, ['hobbies', 0])
      const firstHobby = findNodeByPath(updatedTree, ['hobbies', 0])
      
      expect(firstHobby?.value).toBe('coding')
      expect(firstHobby?.key).toBe(0)
      expect(firstHobby?.path).toEqual(['hobbies', 0])
    })

    it('throws error when removing root', () => {
      expect(() => {
        removeNodeFromParent(rootNode, [])
      }).toThrow('Cannot remove root node')
    })

    it('preserves immutability', () => {
      const originalHobbiesLength = findNodeByPath(rootNode, ['hobbies'])?.children?.length
      removeNodeFromParent(rootNode, ['hobbies', 0])
      
      expect(findNodeByPath(rootNode, ['hobbies'])?.children?.length).toBe(originalHobbiesLength)
    })
  })

  describe('treeToJson', () => {
    it('converts tree back to original JSON structure', () => {
      const reconstructed = treeToJson(rootNode)
      expect(reconstructed).toEqual(sampleJson)
    })

    it('handles primitive root values', () => {
      const stringTree = parseJsonToTree('test')
      expect(treeToJson(stringTree)).toBe('test')
      
      const numberTree = parseJsonToTree(42)
      expect(treeToJson(numberTree)).toBe(42)
    })

    it('handles empty objects and arrays', () => {
      const emptyObjTree = parseJsonToTree({})
      expect(treeToJson(emptyObjTree)).toEqual({})
      
      const emptyArrTree = parseJsonToTree([])
      expect(treeToJson(emptyArrTree)).toEqual([])
    })
  })

})

// Helper function to get all nodes in a tree
function getAllNodes(node: JsonNode): JsonNode[] {
  const nodes = [node]
  if (node.children) {
    for (const child of node.children) {
      nodes.push(...getAllNodes(child))
    }
  }
  return nodes
}