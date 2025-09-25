import { ref } from 'vue'
import type { JsonValue, JsonPath } from '../types'

export interface PendingChange {
  type: 'update' | 'add' | 'delete'
  path: JsonPath
  oldValue?: JsonValue
  newValue?: JsonValue
}

export function useChangeTracking() {
  const pendingChanges = ref<PendingChange[]>([])

  function trackChange(
    path: JsonPath, 
    oldValue: JsonValue | undefined, 
    newValue: JsonValue, 
    type: 'update' | 'add' | 'delete'
  ) {
    // Remove any existing change for this path
    const existingIndex = pendingChanges.value.findIndex(change => 
      JSON.stringify(change.path) === JSON.stringify(path)
    )
    
    if (existingIndex !== -1) {
      pendingChanges.value.splice(existingIndex, 1)
    }
    
    // Add the new change
    pendingChanges.value.push({
      path: [...path],
      oldValue,
      newValue,
      type
    })
  }

  function clearChanges() {
    pendingChanges.value = []
  }

  function hasUnsavedChanges() {
    return pendingChanges.value.length > 0
  }

  return {
    pendingChanges,
    trackChange,
    clearChanges,
    hasUnsavedChanges
  }
}