import { describe, it, expect } from 'vitest'
import { validateJson, inferSchema } from '../json-validator'

describe('json-validator utilities', () => {
  describe('validateJson', () => {
    const validSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number', minimum: 0 },
        email: { type: 'string', format: 'email' },
        active: { type: 'boolean' },
        hobbies: {
          type: 'array',
          items: { type: 'string' }
        },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            city: { type: 'string' }
          },
          required: ['street']
        }
      },
      required: ['name', 'age']
    }

    it('returns empty array for valid JSON', () => {
      const validData = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        active: true,
        hobbies: ['reading', 'coding'],
        address: {
          street: '123 Main St',
          city: 'New York'
        }
      }

      const errors = validateJson(validData, validSchema)
      expect(errors).toEqual([])
    })

    it('detects missing required properties', () => {
      const invalidData = {
        name: 'John Doe'
        // missing required 'age'
      }

      const errors = validateJson(invalidData, validSchema)
      expect(errors).toHaveLength(1)
      expect(errors[0].path).toEqual([])
      expect(errors[0].keyword).toBe('required')
      expect(errors[0].message).toContain('age')
    })

    it('detects type mismatches', () => {
      const invalidData = {
        name: 'John Doe',
        age: 'thirty' // should be number
      }

      const errors = validateJson(invalidData, validSchema)
      expect(errors).toHaveLength(1)
      expect(errors[0].path).toEqual(['age'])
      expect(errors[0].keyword).toBe('type')
    })

    it('detects format violations', () => {
      const invalidData = {
        name: 'John Doe',
        age: 30,
        email: 'invalid-email' // invalid email format
      }

      const errors = validateJson(invalidData, validSchema)
      expect(errors).toHaveLength(1)
      expect(errors[0].path).toEqual(['email'])
      expect(errors[0].keyword).toBe('format')
    })

    it('detects nested object validation errors', () => {
      const invalidData = {
        name: 'John Doe',
        age: 30,
        address: {
          city: 'New York'
          // missing required 'street'
        }
      }

      const errors = validateJson(invalidData, validSchema)
      expect(errors).toHaveLength(1)
      expect(errors[0].path).toEqual(['address'])
      expect(errors[0].keyword).toBe('required')
    })

    it('detects array item validation errors', () => {
      const invalidData = {
        name: 'John Doe',
        age: 30,
        hobbies: ['reading', 123] // number instead of string
      }

      const errors = validateJson(invalidData, validSchema)
      expect(errors).toHaveLength(1)
      expect(errors[0].path).toEqual(['hobbies', 1])
      expect(errors[0].keyword).toBe('type')
    })

    it('detects multiple validation errors', () => {
      const invalidData = {
        name: 123, // should be string
        // missing required 'age'
        email: 'invalid-email', // invalid format
        hobbies: 'not-an-array' // should be array
      }

      const errors = validateJson(invalidData, validSchema)
      expect(errors.length).toBeGreaterThan(1)
    })

    it('handles numeric constraints', () => {
      const invalidData = {
        name: 'John Doe',
        age: -5 // violates minimum: 0
      }

      const errors = validateJson(invalidData, validSchema)
      expect(errors).toHaveLength(1)
      expect(errors[0].path).toEqual(['age'])
      expect(errors[0].keyword).toBe('minimum')
    })

    it('handles complex nested structures', () => {
      const complexSchema = {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                profile: {
                  type: 'object',
                  properties: {
                    settings: {
                      type: 'object',
                      properties: {
                        theme: { type: 'string', enum: ['light', 'dark'] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      const invalidComplexData = {
        users: [
          {
            profile: {
              settings: {
                theme: 'invalid-theme' // not in enum
              }
            }
          }
        ]
      }

      const errors = validateJson(invalidComplexData, complexSchema)
      expect(errors).toHaveLength(1)
      expect(errors[0].path).toEqual(['users', 0, 'profile', 'settings', 'theme'])
      expect(errors[0].keyword).toBe('enum')
    })

    it('throws error for invalid schema', () => {
      const invalidSchema = {
        type: 'invalid-type'
      }

      expect(() => {
        validateJson({ test: 'data' }, invalidSchema)
      }).toThrow()
    })
  })

  describe('inferSchema', () => {
    it('infers schema for simple objects', () => {
      const data = {
        name: 'John',
        age: 30,
        active: true
      }

      const schema = inferSchema(data)
      expect(schema).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          active: { type: 'boolean' }
        },
        required: ['name', 'age', 'active']
      })
    })

    it('infers schema for arrays', () => {
      const data = ['item1', 'item2', 'item3']

      const schema = inferSchema(data)
      expect(schema).toEqual({
        type: 'array',
        items: { type: 'string' }
      })
    })

    it('infers schema for mixed arrays', () => {
      const data = ['string', 123, true]

      const schema = inferSchema(data) as any
      expect(schema.type).toBe('array')
      // Should handle mixed types gracefully
      expect(schema.items).toBeDefined()
    })

    it('infers schema for nested objects', () => {
      const data = {
        user: {
          name: 'John',
          address: {
            street: '123 Main St',
            city: 'New York'
          }
        }
      }

      const schema = inferSchema(data) as any
      expect(schema.type).toBe('object')
      expect(schema.properties.user.type).toBe('object')
      expect(schema.properties.user.properties.address.type).toBe('object')
    })

    it('infers schema for primitive values', () => {
      expect(inferSchema('test')).toEqual({ type: 'string' })
      expect(inferSchema(42)).toEqual({ type: 'number' })
      expect(inferSchema(true)).toEqual({ type: 'boolean' })
      expect(inferSchema(null)).toEqual({ type: 'null' })
    })

    it('handles empty objects and arrays', () => {
      expect(inferSchema({})).toEqual({
        type: 'object',
        properties: {},
        required: []
      })
      
      expect(inferSchema([])).toEqual({
        type: 'array',
        items: {}
      })
    })

    it('infers schema for complex nested structures', () => {
      const complexData = {
        users: [
          {
            name: 'John',
            hobbies: ['reading', 'coding']
          },
          {
            name: 'Jane',
            hobbies: ['music', 'sports']
          }
        ],
        metadata: {
          version: '1.0',
          count: 2
        }
      }

      const schema = inferSchema(complexData) as any
      expect(schema.type).toBe('object')
      expect(schema.properties.users.type).toBe('array')
      expect(schema.properties.users.items.type).toBe('object')
      expect(schema.properties.metadata.type).toBe('object')
    })
  })
})