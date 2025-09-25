import type { JsonValue } from '../types'

export interface ValidationResult {
  isValid: boolean
  sanitizedValue?: JsonValue
  errors: string[]
}

export interface InputValidationOptions {
  maxStringLength?: number
  maxNumberValue?: number
  minNumberValue?: number
  allowedStringPatterns?: RegExp[]
  forbiddenStringPatterns?: RegExp[]
  maxObjectDepth?: number
  maxArrayLength?: number
  maxObjectKeys?: number
  allowCircularReferences?: boolean
  sanitizeHtml?: boolean
  validateUrls?: boolean
  validateEmails?: boolean
}

const DEFAULT_OPTIONS: Required<InputValidationOptions> = {
  maxStringLength: 10000,
  maxNumberValue: Number.MAX_SAFE_INTEGER,
  minNumberValue: Number.MIN_SAFE_INTEGER,
  allowedStringPatterns: [],
  forbiddenStringPatterns: [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript URLs
    /vbscript:/gi, // VBScript URLs
    /on\w+\s*=/gi, // Event handlers
  ],
  maxObjectDepth: 50,
  maxArrayLength: 10000,
  maxObjectKeys: 1000,
  allowCircularReferences: false,
  sanitizeHtml: true,
  validateUrls: true,
  validateEmails: true
}

/**
 * Validates and sanitizes JSON input values
 */
export function validateInput(
  value: JsonValue,
  options: Partial<InputValidationOptions> = {}
): ValidationResult {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  const errors: string[] = []
  
  try {
    const sanitizedValue = validateValueRecursive(value, mergedOptions, errors, 0, new WeakSet())
    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    }
  }
}

function validateValueRecursive(
  value: JsonValue,
  options: Required<InputValidationOptions>,
  errors: string[],
  depth: number,
  visitedObjects: WeakSet<object>
): JsonValue {
  // Check depth limit
  if (depth > options.maxObjectDepth) {
    errors.push(`Maximum object depth exceeded (${options.maxObjectDepth})`)
    return null
  }

  if (value === null || typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return validateString(value, options, errors)
  }

  if (typeof value === 'number') {
    return validateNumber(value, options, errors)
  }

  if (Array.isArray(value)) {
    return validateArray(value, options, errors, depth, visitedObjects)
  }

  if (typeof value === 'object' && value !== null) {
    return validateObject(value, options, errors, depth, visitedObjects)
  }

  errors.push(`Invalid JSON value type: ${typeof value}`)
  return null
}

function validateString(
  value: string,
  options: Required<InputValidationOptions>,
  errors: string[]
): string {
  // Check length
  if (value.length > options.maxStringLength) {
    errors.push(`String length exceeds maximum (${options.maxStringLength})`)
    return value.substring(0, options.maxStringLength)
  }

  let sanitizedValue = value

  // Check forbidden patterns
  for (const pattern of options.forbiddenStringPatterns) {
    if (pattern.test(value)) {
      errors.push(`String contains forbidden pattern: ${pattern.source}`)
      sanitizedValue = sanitizedValue.replace(pattern, '')
    }
  }

  // Check allowed patterns (if specified)
  if (options.allowedStringPatterns.length > 0) {
    const isAllowed = options.allowedStringPatterns.some(pattern => pattern.test(value))
    if (!isAllowed) {
      errors.push('String does not match any allowed patterns')
    }
  }

  // HTML sanitization
  if (options.sanitizeHtml) {
    sanitizedValue = sanitizeHtmlString(sanitizedValue)
  }

  // URL validation
  if (options.validateUrls && looksLikeUrl(value)) {
    if (!isValidUrl(value)) {
      errors.push(`Invalid URL format: ${value}`)
    }
  }

  // Email validation
  if (options.validateEmails && looksLikeEmail(value)) {
    if (!isValidEmail(value)) {
      errors.push(`Invalid email format: ${value}`)
    }
  }

  return sanitizedValue
}

function validateNumber(
  value: number,
  options: Required<InputValidationOptions>,
  errors: string[]
): number {
  // Check for invalid numbers
  if (!Number.isFinite(value)) {
    errors.push(`Invalid number: ${value}`)
    return 0
  }

  // Check range
  if (value > options.maxNumberValue) {
    errors.push(`Number exceeds maximum value (${options.maxNumberValue})`)
    return options.maxNumberValue
  }

  if (value < options.minNumberValue) {
    errors.push(`Number below minimum value (${options.minNumberValue})`)
    return options.minNumberValue
  }

  return value
}

function validateArray(
  value: JsonValue[],
  options: Required<InputValidationOptions>,
  errors: string[],
  depth: number,
  visitedObjects: WeakSet<object>
): JsonValue[] {
  // Check circular references
  if (!options.allowCircularReferences && visitedObjects.has(value)) {
    errors.push('Circular reference detected in array')
    return []
  }

  visitedObjects.add(value)

  // Check length
  if (value.length > options.maxArrayLength) {
    errors.push(`Array length exceeds maximum (${options.maxArrayLength})`)
    value = value.slice(0, options.maxArrayLength)
  }

  // Validate each element
  const sanitizedArray = value.map((item, index) => {
    try {
      return validateValueRecursive(item, options, errors, depth + 1, visitedObjects)
    } catch (error) {
      errors.push(`Error validating array element at index ${index}: ${error}`)
      return null
    }
  })

  visitedObjects.delete(value)
  return sanitizedArray
}

function validateObject(
  value: Record<string, JsonValue>,
  options: Required<InputValidationOptions>,
  errors: string[],
  depth: number,
  visitedObjects: WeakSet<object>
): Record<string, JsonValue> {
  // Check circular references
  if (!options.allowCircularReferences && visitedObjects.has(value)) {
    errors.push('Circular reference detected in object')
    return {}
  }

  visitedObjects.add(value)

  const keys = Object.keys(value)

  // Check number of keys
  if (keys.length > options.maxObjectKeys) {
    errors.push(`Object has too many keys (${keys.length}, max: ${options.maxObjectKeys})`)
  }

  const sanitizedObject: Record<string, JsonValue> = {}
  const keysToProcess = keys.slice(0, options.maxObjectKeys)

  for (const key of keysToProcess) {
    // Validate key
    const sanitizedKey = validateString(key, options, errors)
    
    // Validate value
    try {
      const sanitizedValue = validateValueRecursive(
        value[key],
        options,
        errors,
        depth + 1,
        visitedObjects
      )
      sanitizedObject[sanitizedKey] = sanitizedValue
    } catch (error) {
      errors.push(`Error validating object property '${key}': ${error}`)
    }
  }

  visitedObjects.delete(value)
  return sanitizedObject
}

function sanitizeHtmlString(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//.test(value) || /^ftp:\/\//.test(value)
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function looksLikeEmail(value: string): boolean {
  return /@/.test(value) && value.includes('.')
}

function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * Validates JSON string input before parsing
 */
export function validateJsonString(jsonString: string): ValidationResult {
  const errors: string[] = []

  // Check for basic structure
  if (!jsonString.trim()) {
    errors.push('JSON string is empty')
    return { isValid: false, errors }
  }

  // Check for common injection patterns
  const suspiciousPatterns = [
    /__proto__/gi,
    /constructor/gi,
    /prototype/gi,
    /\beval\b/gi,
    /\bFunction\b/gi,
    /javascript:/gi,
    /<script/gi
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(jsonString)) {
      errors.push(`Potentially dangerous pattern detected: ${pattern.source}`)
    }
  }

  // Try to parse JSON
  try {
    const parsed = JSON.parse(jsonString)
    
    // Validate the parsed object
    const validationResult = validateInput(parsed)
    
    return {
      isValid: validationResult.isValid && errors.length === 0,
      sanitizedValue: validationResult.sanitizedValue,
      errors: [...errors, ...validationResult.errors]
    }
  } catch (parseError) {
    errors.push(`JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    return { isValid: false, errors }
  }
}

/**
 * Validates object keys for security
 */
export function validateObjectKey(key: string): ValidationResult {
  const errors: string[] = []

  // Check for prototype pollution
  const dangerousKeys = ['__proto__', 'constructor', 'prototype']
  if (dangerousKeys.includes(key)) {
    errors.push(`Dangerous object key: ${key}`)
  }

  // Check for suspicious patterns
  if (/^\d+$/.test(key) && parseInt(key, 10) > 1000000) {
    errors.push('Numeric key is too large, potential DoS')
  }

  const fullOptions: Required<InputValidationOptions> = {
    maxStringLength: 100,
    maxNumberValue: Number.MAX_SAFE_INTEGER,
    minNumberValue: Number.MIN_SAFE_INTEGER,
    allowedStringPatterns: [],
    forbiddenStringPatterns: [],
    maxArrayLength: 1000,
    maxObjectKeys: 100,
    maxObjectDepth: 10,
    allowCircularReferences: false,
    sanitizeHtml: true,
    validateUrls: false,
    validateEmails: false
  }
  const sanitizedKey = validateString(key, fullOptions, errors)

  return {
    isValid: errors.length === 0,
    sanitizedValue: sanitizedKey,
    errors
  }
}