import type { JsonValue, JsonPath } from '../types'

// Helper function to set a value at a specific path in JSON
export function setValueAtPath(obj: Record<string, JsonValue> | JsonValue[], path: JsonPath, value: JsonValue) {
  let current = obj as Record<string | number, JsonValue>
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (!(key in current)) {
      // Create new object/array as needed
      current[key] = typeof path[i + 1] === 'number' ? [] : {}
    }
    current = current[key] as Record<string | number, JsonValue>
  }
  current[path[path.length - 1]] = value
}

// Helper function to delete a value at a specific path in JSON
export function deleteValueAtPath(obj: Record<string, JsonValue> | JsonValue[], path: JsonPath) {
  if (path.length === 0) return
  
  let current = obj as Record<string | number, JsonValue>
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]] as Record<string | number, JsonValue>
    if (current === undefined) return
  }
  
  const lastKey = path[path.length - 1]
  if (Array.isArray(current)) {
    current.splice(Number(lastKey), 1)
  } else {
    delete current[lastKey]
  }
}

// Helper function to get a value at a specific path in JSON
export function getValueAtPath(obj: Record<string, JsonValue> | JsonValue[], path: JsonPath): JsonValue | undefined {
  let current: JsonValue = obj
  for (const key of path) {
    if (current && typeof current === 'object' && !Array.isArray(current)) {
      current = (current as Record<string, JsonValue>)[key]
    } else if (Array.isArray(current) && typeof key === 'number') {
      current = current[key]
    } else {
      return undefined
    }
    if (current === undefined) return undefined
  }
  return current
}

// Helper function to format a JsonValue for display
export function formatValue(value: JsonValue): string {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'object') {
    return Array.isArray(value) ? `[${value.length} items]` : `{${Object.keys(value).length} props}`
  }
  return String(value)
}