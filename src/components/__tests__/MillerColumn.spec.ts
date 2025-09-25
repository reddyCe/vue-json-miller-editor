import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MillerColumn from '../MillerColumn.vue'
import type { JsonNode, ValidationError } from '@/types'

describe('MillerColumn', () => {
  const mockItems: JsonNode[] = [
    {
      id: 'item1',
      path: ['name'],
      key: 'name',
      value: 'test',
      type: 'string'
    },
    {
      id: 'item2',
      path: ['obj'],
      key: 'obj',
      value: { prop: 'value' },
      type: 'object',
      children: [
        {
          id: 'item3',
          path: ['obj', 'prop'],
          key: 'prop',
          value: 'value',
          type: 'string'
        }
      ]
    }
  ]

  const mockValidationErrors: ValidationError[] = [
    {
      keyword: 'required',
      message: 'is required',
      path: ['name'],
      schemaPath: '#/required'
    }
  ]

  it('renders column with title and items', () => {
    const wrapper = mount(MillerColumn, {
      props: {
        items: mockItems,
        title: 'Test Column',
        validationErrors: []
      }
    })

    expect(wrapper.find('.column-header').text()).toBe('Test Column')
    expect(wrapper.findAll('.column-item')).toHaveLength(2)
  })

  it('displays item names correctly', () => {
    const wrapper = mount(MillerColumn, {
      props: {
        items: mockItems,
        title: 'Test Column',
        validationErrors: []
      }
    })

    const items = wrapper.findAll('.item-name')
    expect(items[0].text()).toBe('name')
    expect(items[1].text()).toBe('obj')
  })

  it('shows type indicators with correct icons', () => {
    const wrapper = mount(MillerColumn, {
      props: {
        items: mockItems,
        title: 'Test Column',
        validationErrors: []
      }
    })

    const typeIndicators = wrapper.findAll('.type-indicator')
    expect(typeIndicators[0].text()).toBe('"') // string icon
    expect(typeIndicators[1].text()).toBe('{ }') // object icon
  })

  it('highlights selected item', () => {
    const wrapper = mount(MillerColumn, {
      props: {
        items: mockItems,
        title: 'Test Column',
        selectedItemId: 'item1',
        validationErrors: []
      }
    })

    const items = wrapper.findAll('.column-item')
    expect(items[0].classes()).toContain('selected')
    expect(items[1].classes()).not.toContain('selected')
  })

  it('shows has-children class for containers', () => {
    const wrapper = mount(MillerColumn, {
      props: {
        items: mockItems,
        title: 'Test Column',
        validationErrors: []
      }
    })

    const items = wrapper.findAll('.column-item')
    expect(items[0].classes()).not.toContain('has-children')
    expect(items[1].classes()).toContain('has-children')
  })

  it('displays error indicators for items with validation errors', () => {
    const wrapper = mount(MillerColumn, {
      props: {
        items: mockItems,
        title: 'Test Column',
        validationErrors: mockValidationErrors
      }
    })

    const errorIndicators = wrapper.findAll('.error-indicator')
    expect(errorIndicators).toHaveLength(1)
    expect(errorIndicators[0].attributes('title')).toBe('1 validation error(s)')
  })

  it('emits select-item event when item is clicked', async () => {
    const wrapper = mount(MillerColumn, {
      props: {
        items: mockItems,
        title: 'Test Column',
        validationErrors: []
      }
    })

    await wrapper.findAll('.column-item')[0].trigger('click')
    
    expect(wrapper.emitted('select-item')).toHaveLength(1)
    expect(wrapper.emitted('select-item')![0]).toEqual([mockItems[0]])
  })
})