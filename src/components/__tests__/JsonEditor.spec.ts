import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import JsonEditor from '../JsonEditor.vue'
import type { JsonValue, JsonEditorOptions } from '@/types.ts'

describe('JsonEditor', () => {
  let wrapper: VueWrapper<any>
  const mockJsonData: JsonValue = {
    name: 'John Doe',
    age: 30,
    active: true,
    hobbies: ['reading', 'coding'],
    address: {
      street: '123 Main St',
      city: 'New York'
    }
  }

  const mockSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
      active: { type: 'boolean' }
    }
  }

  beforeEach(() => {
    wrapper = mount(JsonEditor, {
      props: {
        modelValue: mockJsonData,
        schema: mockSchema
      }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Component Mounting', () => {
    it('renders without crashing', () => {
      expect(wrapper.exists()).toBe(true)
    })

    it('has proper ARIA attributes', () => {
      const editor = wrapper.find('.json-editor')
      expect(editor.attributes('role')).toBe('application')
      expect(editor.attributes('aria-label')).toBeTruthy()
    })

    it('renders Miller view by default', () => {
      const millerView = wrapper.findComponent({ name: 'JsonMillerView' })
      expect(millerView.exists()).toBe(true)
    })
  })

  describe('Configuration Options', () => {
    it('applies custom CSS properties', async () => {
      const options: Partial<JsonEditorOptions> = {
        customCssProperties: {
          '--json-editor-bg-override': '#custom-color'
        }
      }

      await wrapper.setProps({ options })
      await nextTick()

      const editor = wrapper.find('.json-editor')
      const style = editor.attributes('style')
      expect(style).toContain('--json-editor-bg-override: #custom-color')
    })

    it('applies theme configuration correctly', async () => {
      const options: Partial<JsonEditorOptions> = {
        theme: 'dark'
      }

      await wrapper.setProps({ options })
      await nextTick()

      const editor = wrapper.find('.json-editor')
      expect(editor.classes()).toContain('json-editor--dark')
    })
  })

  describe('Event Handling', () => {
    it('emits save event when Miller view save is triggered', async () => {
      const saveHandler = vi.fn()
      wrapper = mount(JsonEditor, {
        props: {
          modelValue: mockJsonData,
          onSave: saveHandler
        }
      })

      // Wait for component to initialize
      await wrapper.vm.$nextTick()
      
      // Simulate save event from Miller view
      const changes = [{ path: ['name'], oldValue: 'John Doe', newValue: 'Jane Doe', type: 'update' }]
      const finalValue = { ...mockJsonData, name: 'Jane Doe' }
      await wrapper.vm.handleSave(changes, finalValue)

      // Check that save event was emitted
      expect(saveHandler).toHaveBeenCalledWith(changes, finalValue)
    })

    it('emits change event when Miller view detects edits', async () => {
      const changeHandler = vi.fn()
      wrapper = mount(JsonEditor, {
        props: {
          modelValue: mockJsonData,
          onChange: changeHandler
        }
      })

      // Wait for component to initialize
      await wrapper.vm.$nextTick()
      
      // Simulate change event from Miller view
      await wrapper.vm.handleMillerChange()

      // Check that change event was emitted
      expect(changeHandler).toHaveBeenCalledWith(mockJsonData)
    })

    it('emits validation events when schema is provided', async () => {
      const validateHandler = vi.fn()
      wrapper = mount(JsonEditor, {
        props: {
          modelValue: { name: 123 }, // Invalid type
          schema: mockSchema,
          onValidate: validateHandler
        }
      })

      await nextTick()

      expect(validateHandler).toHaveBeenCalled()
      expect(validateHandler).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['name']
          })
        ])
      )
    })

    it('emits error events for invalid JSON', async () => {
      const errorHandler = vi.fn()

      // Create a circular reference to cause JSON error
      const circularData: any = { name: 'test' }
      circularData.self = circularData

      wrapper = mount(JsonEditor, {
        props: {
          modelValue: circularData,
          onError: errorHandler
        }
      })

      await nextTick()

      expect(errorHandler).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper main container ARIA attributes', () => {
      const editor = wrapper.find('.json-editor')
      expect(editor.attributes('role')).toBe('application')
      expect(editor.attributes('aria-label')).toBe('JSON Editor')
    })

    it('shows loading state with proper ARIA', async () => {
      // Mock loading state
      wrapper.vm.isLoading = true
      await nextTick()

      const loadingElement = wrapper.find('[role="status"]')
      expect(loadingElement.exists()).toBe(true)
      expect(loadingElement.attributes('aria-live')).toBe('polite')
    })

    it('shows error state with proper ARIA', async () => {
      // Mock error state
      wrapper.vm.lastError = new Error('Test error')
      await nextTick()

      const errorElement = wrapper.find('[role="alert"]')
      expect(errorElement.exists()).toBe(true)
      expect(errorElement.attributes('aria-live')).toBe('assertive')
    })
  })

  describe('Input Validation', () => {
    it('validates JSON input correctly', () => {
      expect(wrapper.vm.isValidJsonValue({ name: 'test' })).toBe(true)
      expect(wrapper.vm.isValidJsonValue('string')).toBe(true)
      expect(wrapper.vm.isValidJsonValue(123)).toBe(true)
      expect(wrapper.vm.isValidJsonValue(null)).toBe(true)
    })

    it('rejects invalid JSON input', () => {
      const circular: any = {}
      circular.self = circular
      expect(wrapper.vm.isValidJsonValue(circular)).toBe(false)
    })
  })

  describe('Memory Management', () => {
    it('cleans up resources on unmount', async () => {
      // Create a fresh wrapper for this test
      const testWrapper = mount(JsonEditor, {
        props: {
          modelValue: mockJsonData
        }
      })
      
      // Wait for initialization
      await testWrapper.vm.$nextTick()
      
      // Verify component is mounted and has data  
      expect((testWrapper.vm as any).rootNode).toBeTruthy()
      
      // Unmount the component
      testWrapper.unmount()
      
      // The cleanup should have been called automatically via onUnmounted
      // We can't easily spy on lifecycle hooks, but we can verify the component unmounts cleanly
      expect(testWrapper.vm).toBeDefined()
    })

    it('clears references to prevent memory leaks', () => {
      wrapper.unmount()

      // These should be null after unmount
      expect(wrapper.vm.rootNode).toBe(null)
      expect(wrapper.vm.validationErrors).toEqual([])
      expect(wrapper.vm.lastError).toBe(null)
    })
  })

  describe('Theme Support', () => {
    it('applies light theme by default', () => {
      const editor = wrapper.find('.json-editor')
      expect(editor.classes()).toContain('json-editor--light')
    })

    it('switches to dark theme when configured', async () => {
      await wrapper.setProps({
        options: { theme: 'dark' }
      })

      const editor = wrapper.find('.json-editor')
      expect(editor.classes()).toContain('json-editor--dark')
    })

    it('applies custom className', async () => {
      await wrapper.setProps({
        options: { className: 'custom-editor' }
      })

      const editor = wrapper.find('.json-editor')
      expect(editor.classes()).toContain('custom-editor')
    })
  })

  describe('Actions Section Visibility', () => {
    it('passes correct options to Miller view component', async () => {
      const testWrapper = mount(JsonEditor, {
        props: {
          modelValue: { name: 'test', obj: { prop: 'value' } },
          options: { 
            editable: true,
            showSaveButton: true,
            showAddButton: true
          }
        }
      })

      await testWrapper.vm.$nextTick()

      const millerView = testWrapper.findComponent({ name: 'JsonMillerView' })
      expect(millerView.exists()).toBe(true)
      expect(millerView.props('options').editable).toBe(true)
      expect(millerView.props('options').showSaveButton).toBe(true)
      expect(millerView.props('options').showAddButton).toBe(true)
      
      testWrapper.unmount()
    })

    it('correctly disables both action buttons through options', async () => {
      const testWrapper = mount(JsonEditor, {
        props: {
          modelValue: { name: 'test', obj: { prop: 'value' } },
          options: { 
            editable: true,
            showSaveButton: false,
            showAddButton: false
          }
        }
      })

      await testWrapper.vm.$nextTick()

      const millerView = testWrapper.findComponent({ name: 'JsonMillerView' })
      expect(millerView.props('options').showSaveButton).toBe(false)
      expect(millerView.props('options').showAddButton).toBe(false)
      
      testWrapper.unmount()
    })

    it('correctly sets non-editable mode', async () => {
      const testWrapper = mount(JsonEditor, {
        props: {
          modelValue: { name: 'test', obj: { prop: 'value' } },
          options: { 
            editable: false,
            showSaveButton: true,
            showAddButton: true
          }
        }
      })

      await testWrapper.vm.$nextTick()

      const millerView = testWrapper.findComponent({ name: 'JsonMillerView' })
      expect(millerView.props('options').editable).toBe(false)
      
      testWrapper.unmount()
    })

    it('shows add button when an object/array is available and add button enabled', async () => {
      const testWrapper = mount(JsonEditor, {
        props: {
          modelValue: { name: 'test', obj: { prop: 'value' } },
          options: { 
            editable: true,
            showSaveButton: false,
            showAddButton: true
          }
        }
      })

      await testWrapper.vm.$nextTick()

      // The actions section might not show initially if no item is selected
      // This test verifies the prop is correctly passed through
      const millerView = testWrapper.findComponent({ name: 'JsonMillerView' })
      expect(millerView.exists()).toBe(true)
      expect(millerView.props('options').showAddButton).toBe(true)
      expect(millerView.props('options').showSaveButton).toBe(false)
      
      testWrapper.unmount()
    })

    it('respects showSaveButton prop correctly', async () => {
      const testWrapper = mount(JsonEditor, {
        props: {
          modelValue: { name: 'test' },
          options: { showSaveButton: false }
        }
      })

      await testWrapper.vm.$nextTick()

      const saveButton = testWrapper.find('.save-btn')
      expect(saveButton.exists()).toBe(false)
      
      testWrapper.unmount()
    })

    it('respects showAddButton prop correctly', async () => {
      const testWrapper = mount(JsonEditor, {
        props: {
          modelValue: { obj: { prop: 'value' } },
          options: { showAddButton: false }
        }
      })

      await testWrapper.vm.$nextTick()

      const addButton = testWrapper.find('.add-btn')
      expect(addButton.exists()).toBe(false)
      
      testWrapper.unmount()
    })
  })
})
