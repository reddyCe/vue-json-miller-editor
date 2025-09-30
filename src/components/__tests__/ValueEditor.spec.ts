import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ValueEditor from '../ValueEditor.vue'
import type { JsonNode } from '@/types'
import { mergeOptions } from '@/utils/config'

describe('ValueEditor', () => {
  const mockStringItem: JsonNode = {
    id: 'string-item',
    path: ['name'],
    key: 'name',
    value: 'test value',
    type: 'string'
  }

  const mockNumberItem: JsonNode = {
    id: 'number-item',
    path: ['age'],
    key: 'age',
    value: 25,
    type: 'number'
  }

  const mockBooleanItem: JsonNode = {
    id: 'boolean-item',
    path: ['active'],
    key: 'active',
    value: true,
    type: 'boolean'
  }

  const mockObjectItem: JsonNode = {
    id: 'object-item',
    path: ['obj'],
    key: 'obj',
    value: { prop: 'value' },
    type: 'object',
    children: []
  }

  const defaultOptions = mergeOptions({
    editable: true,
    locale: {
      editValue: 'Edit Value'
    }
  })

  it('does not render for container types (object/array)', () => {
    const wrapper = mount(ValueEditor, {
      props: {
        selectedItem: mockObjectItem,
        options: defaultOptions
      }
    })

    expect(wrapper.find('.value-section').exists()).toBe(false)
  })

  it('renders value editor for primitive types', () => {
    const wrapper = mount(ValueEditor, {
      props: {
        selectedItem: mockStringItem,
        options: defaultOptions
      }
    })

    expect(wrapper.find('.value-section').exists()).toBe(true)
    expect(wrapper.find('.section-title').text()).toBe('Edit Value')
  })

  it('displays correct type selector options', () => {
    const wrapper = mount(ValueEditor, {
      props: {
        selectedItem: mockStringItem,
        options: defaultOptions
      }
    })

    const typeOptions = wrapper.findAll('option')
    expect(typeOptions).toHaveLength(4)
    expect(typeOptions.map(o => o.attributes('value'))).toEqual(['string', 'number', 'boolean', 'null'])
  })

  it('shows text input for string type', () => {
    const wrapper = mount(ValueEditor, {
      props: {
        selectedItem: mockStringItem,
        options: defaultOptions
      }
    })

    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('select.value-input-wide').exists()).toBe(false)
    expect(wrapper.find('.null-display').exists()).toBe(false)
  })

  it('shows number input for number type', () => {
    const wrapper = mount(ValueEditor, {
      props: {
        selectedItem: mockNumberItem,
        options: defaultOptions
      }
    })

    expect(wrapper.find('input[type="number"]').exists()).toBe(true)
  })

  it('shows select input for boolean type', () => {
    const wrapper = mount(ValueEditor, {
      props: {
        selectedItem: mockBooleanItem,
        options: defaultOptions
      }
    })

    expect(wrapper.find('select.value-input-wide').exists()).toBe(true)
    const booleanOptions = wrapper.findAll('select.value-input-wide option')
    expect(booleanOptions.map(o => o.attributes('value'))).toEqual(['true', 'false'])
  })

  it('shows null display for null type', async () => {
    const wrapper = mount(ValueEditor, {
      props: {
        selectedItem: mockStringItem,
        options: defaultOptions
      }
    })

    // Change type to null
    await wrapper.find('.type-selector').setValue('null')
    
    expect(wrapper.find('.null-display').exists()).toBe(true)
    expect(wrapper.find('.null-display').text()).toBe('null')
  })

  it('updates edit values when selected item changes', async () => {
    const wrapper = mount(ValueEditor, {
      props: {
        selectedItem: mockStringItem,
        options: defaultOptions
      }
    })

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('test value')
    expect((wrapper.find('.type-selector').element as HTMLSelectElement).value).toBe('string')

    // Change to number item
    await wrapper.setProps({ selectedItem: mockNumberItem })
    
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('25')
    expect((wrapper.find('.type-selector').element as HTMLSelectElement).value).toBe('number')
  })

  it('emits update-value when input value changes', async () => {
    const wrapper = mount(ValueEditor, {
      props: {
        selectedItem: mockStringItem,
        options: defaultOptions
      }
    })

    const input = wrapper.find('input')
    await input.setValue('new value')
    await input.trigger('blur')
    
    expect(wrapper.emitted('update-value')).toHaveLength(1)
    expect(wrapper.emitted('update-value')![0]).toEqual(['new value', 'string'])
  })

  it('emits update-value when Enter key is pressed', async () => {
    const wrapper = mount(ValueEditor, {
      props: {
        selectedItem: mockStringItem,
        options: defaultOptions
      }
    })

    const input = wrapper.find('input')
    await input.setValue('enter value')
    await input.trigger('keydown.enter')
    
    expect(wrapper.emitted('update-value')).toHaveLength(1)
    expect(wrapper.emitted('update-value')![0]).toEqual(['enter value', 'string'])
  })

  it('converts and emits correct value types', async () => {
    const wrapper = mount(ValueEditor, {
      props: {
        selectedItem: mockStringItem,
        options: defaultOptions
      }
    })

    // Test number conversion - type change triggers convertValue (emits 0), then manual input
    await wrapper.find('.type-selector').setValue('number')
    // Clear the emitted events from convertValue
    wrapper.vm.$nextTick()
    
    await wrapper.find('input').setValue('42')
    await wrapper.find('input').trigger('blur')
    
    // Should have at least one update-value event
    const updateEvents = wrapper.emitted('update-value') as unknown[][]
    expect(updateEvents.length).toBeGreaterThan(0)
    
    // Last event should be the manual input
    const lastEvent = updateEvents[updateEvents.length - 1]
    expect(lastEvent).toEqual([42, 'number'])

    // Test boolean conversion
    await wrapper.find('.type-selector').setValue('boolean')
    await wrapper.find('select.value-input-wide').setValue('true')
    
    const allEvents = wrapper.emitted('update-value') as unknown[][]
    const lastBooleanEvent = allEvents[allEvents.length - 1]
    expect(lastBooleanEvent).toEqual([true, 'boolean'])
  })

  it('handles invalid number input gracefully', async () => {
    const wrapper = mount(ValueEditor, {
      props: {
        selectedItem: mockNumberItem,
        options: defaultOptions
      }
    })

    const input = wrapper.find('input')
    await input.setValue('not-a-number')
    await input.trigger('blur')
    
    // Should reset to original value on invalid input
    expect(input.element.value).toBe('25')
  })
})