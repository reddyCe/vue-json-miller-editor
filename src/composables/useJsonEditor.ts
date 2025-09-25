import { ref, computed, type Ref } from 'vue'
import type { 
  JsonValue, 
  JsonNode, 
  JsonPath, 
  JsonEditorOptions, 
  ValidationError 
} from '../types'
import { 
  parseJsonToTree, 
  treeToJson, 
  updateNodeValue,
  addNodeToObject,
  removeNodeFromParent,
  collapseAllNodes
} from '../utils/json-model'
import { validateJson as validate } from '../utils/json-validator'
import { mergeOptions } from '../utils/config'

export function useJsonEditor(
  initialValue: Ref<JsonValue>,
  userOptions: Ref<Partial<JsonEditorOptions>> = ref({}),
  schema?: Ref<object | undefined>
) {
  const rootNode = ref<JsonNode | null>(null)
  const validationErrors = ref<ValidationError[]>([])
  const history = ref<JsonValue[]>([])
  const historyIndex = ref(-1)
  
  const options = computed(() => mergeOptions(userOptions.value))
  
  const jsonString = computed(() => {
    try {
      return JSON.stringify(initialValue.value, null, 2)
    } catch {
      return ''
    }
  })
  
  function initializeTree() {
    try {
      rootNode.value = parseJsonToTree(initialValue.value)
      if (options.value.collapseDepth !== undefined) {
        rootNode.value = collapseAllNodes(rootNode.value, 0, options.value.collapseDepth)
      }
      
      // Add to history
      if (options.value.autoSave) {
        addToHistory(initialValue.value)
      }
    } catch (error) {
      console.error('Failed to initialize tree:', error)
    }
  }
  
  function addToHistory(value: JsonValue) {
    // Remove any future history beyond current index
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(structuredClone(value))
    historyIndex.value = history.value.length - 1
    
    // Limit history size
    if (history.value.length > 50) {
      history.value.shift()
      historyIndex.value--
    }
  }
  
  function undo(): boolean {
    if (historyIndex.value > 0) {
      historyIndex.value--
      const previousValue = history.value[historyIndex.value]
      initialValue.value = structuredClone(previousValue)
      initializeTree()
      return true
    }
    return false
  }
  
  function redo(): boolean {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      const nextValue = history.value[historyIndex.value]
      initialValue.value = structuredClone(nextValue)
      initializeTree()
      return true
    }
    return false
  }
  
  function updateValue(path: JsonPath, value: JsonValue) {
    if (!rootNode.value) return false
    
    try {
      // const oldValue = initialValue.value // Unused but may be needed for history
      rootNode.value = updateNodeValue(rootNode.value, path, value)
      const newJson = treeToJson(rootNode.value)
      
      initialValue.value = newJson
      
      if (options.value.autoSave) {
        addToHistory(newJson)
      }
      
      if (options.value.validationMode === 'onChange') {
        validateCurrentJson()
      }
      
      return true
    } catch (error) {
      console.error('Failed to update value:', error)
      return false
    }
  }
  
  function addProperty(path: JsonPath, key: string, value: JsonValue) {
    if (!rootNode.value) return false
    
    try {
      rootNode.value = addNodeToObject(rootNode.value, path, key, value)
      const newJson = treeToJson(rootNode.value)
      
      initialValue.value = newJson
      
      if (options.value.autoSave) {
        addToHistory(newJson)
      }
      
      if (options.value.validationMode === 'onChange') {
        validateCurrentJson()
      }
      
      return true
    } catch (error) {
      console.error('Failed to add property:', error)
      return false
    }
  }
  
  function removeNode(path: JsonPath) {
    if (!rootNode.value) return false
    
    try {
      rootNode.value = removeNodeFromParent(rootNode.value, path)
      const newJson = treeToJson(rootNode.value)
      
      initialValue.value = newJson
      
      if (options.value.autoSave) {
        addToHistory(newJson)
      }
      
      if (options.value.validationMode === 'onChange') {
        validateCurrentJson()
      }
      
      return true
    } catch (error) {
      console.error('Failed to remove node:', error)
      return false
    }
  }
  
  function validateCurrentJson() {
    if (!schema?.value || options.value.validationMode === 'disabled') {
      validationErrors.value = []
      return []
    }
    
    try {
      const errors = validate(initialValue.value, schema.value)
      validationErrors.value = errors
      return errors
    } catch (error) {
      console.error('Validation error:', error)
      return []
    }
  }
  
  function collapseAll() {
    if (!rootNode.value) return
    rootNode.value = collapseAllNodes(rootNode.value, 0, 0)
  }
  
  function expandAll() {
    if (!rootNode.value) return
    rootNode.value = collapseAllNodes(rootNode.value, 0, Infinity)
  }
  
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)
  const hasValidationErrors = computed(() => validationErrors.value.length > 0)
  
  return {
    // State
    rootNode,
    validationErrors,
    options,
    jsonString,
    history,
    historyIndex,
    
    // Computed
    canUndo,
    canRedo,
    hasValidationErrors,
    
    // Actions
    initializeTree,
    updateValue,
    addProperty,
    removeNode,
    validateCurrentJson,
    collapseAll,
    expandAll,
    undo,
    redo,
    addToHistory
  }
}