import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import type { JsonValue, ValidationError, JsonPath } from '../types'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

export function validateJson(
  data: JsonValue,
  schema: object
): ValidationError[] {
  const validate = ajv.compile(schema)
  const valid = validate(data)
  
  if (valid) return []
  
  return (validate.errors || []).map(error => ({
    path: instancePathToJsonPath(error.instancePath || ''),
    message: error.message || 'Validation error',
    keyword: error.keyword,
    schemaPath: error.schemaPath
  }))
}

function instancePathToJsonPath(instancePath: string): JsonPath {
  if (!instancePath || instancePath === '') return []
  
  return instancePath
    .split('/')
    .slice(1)
    .map(segment => {
      const num = parseInt(segment, 10)
      return isNaN(num) ? segment : num
    })
}

export function inferSchema(data: JsonValue): object {
  if (data === null) {
    return { type: 'null' }
  }
  
  if (Array.isArray(data)) {
    const items = data.length > 0 ? inferSchema(data[0]) : {}
    return {
      type: 'array',
      items
    }
  }
  
  if (typeof data === 'object') {
    const properties: Record<string, object> = {}
    const required: string[] = []
    
    for (const [key, value] of Object.entries(data)) {
      properties[key] = inferSchema(value)
      required.push(key)
    }
    
    return {
      type: 'object',
      properties,
      required
    }
  }
  
  if (typeof data === 'string') {
    if (isDateString(data)) {
      return { type: 'string', format: 'date-time' }
    }
    if (isEmailString(data)) {
      return { type: 'string', format: 'email' }
    }
    if (isUriString(data)) {
      return { type: 'string', format: 'uri' }
    }
    return { type: 'string' }
  }
  
  return { type: typeof data }
}

function isDateString(str: string): boolean {
  const date = new Date(str)
  return !isNaN(date.getTime()) && str.includes('T')
}

function isEmailString(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
}

function isUriString(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}