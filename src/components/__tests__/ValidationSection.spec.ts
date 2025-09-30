import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ValidationSection from '../ValidationSection.vue'
import type { ValidationError } from '@/types'

describe('ValidationSection', () => {
  const mockErrors: ValidationError[] = [
    {
      keyword: 'required',
      message: 'is required',
      path: ['name'],
      schemaPath: '#/required'
    },
    {
      keyword: 'type',
      message: 'should be string',
      path: ['age'],
      schemaPath: '#/properties/age/type'
    }
  ]

  it('does not render when no errors or warnings', () => {
    const wrapper = mount(ValidationSection, {
      props: {
        errors: [],
        validationWarning: null
      }
    })

    expect(wrapper.find('.validation-issues').exists()).toBe(false)
  })

  it('renders validation errors section', () => {
    const wrapper = mount(ValidationSection, {
      props: {
        errors: mockErrors,
        validationWarning: null
      }
    })

    expect(wrapper.find('.validation-errors-compact').exists()).toBe(true)
    expect(wrapper.find('.error-count').text()).toBe('2 validation errors')
  })

  it('renders validation warning section', () => {
    const wrapper = mount(ValidationSection, {
      props: {
        errors: [],
        validationWarning: 'This change may cause issues'
      }
    })

    expect(wrapper.find('.validation-warning-section').exists()).toBe(true)
    expect(wrapper.find('.warning-message').text()).toBe('This change may cause issues')
  })

  it('toggles error expansion when clicked', async () => {
    // Use 3 errors to ensure it starts collapsed
    const manyErrors = [
      ...mockErrors,
      {
        keyword: 'minLength',
        message: 'should be longer',
        path: ['description'],
        schemaPath: '#/properties/description/minLength'
      }
    ]
    
    const wrapper = mount(ValidationSection, {
      props: {
        errors: manyErrors,
        validationWarning: null
      }
    })

    // Initially collapsed for more than 2 errors
    expect(wrapper.find('.error-list').exists()).toBe(false)
    
    // Click to expand
    await wrapper.find('.error-summary').trigger('click')
    
    expect(wrapper.find('.error-list').exists()).toBe(true)
    expect(wrapper.findAll('.error-item-compact')).toHaveLength(3)
  })

  it('auto-expands errors when there are 1-2 errors', () => {
    const singleError = [mockErrors[0]]
    const wrapper = mount(ValidationSection, {
      props: {
        errors: singleError,
        validationWarning: null
      }
    })

    // Should be auto-expanded for 1-2 errors
    expect(wrapper.find('.error-list').exists()).toBe(true)
  })

  it('displays error details correctly', async () => {
    // Use 3 errors to ensure it starts collapsed (not auto-expanded)
    const manyErrors = [
      ...mockErrors,
      {
        keyword: 'minimum',
        message: 'should be >= 0',
        path: ['count'],
        schemaPath: '#/properties/count/minimum'
      }
    ]
    
    const wrapper = mount(ValidationSection, {
      props: {
        errors: manyErrors,
        validationWarning: null
      }
    })

    // Should start collapsed with 3+ errors
    expect(wrapper.find('.error-list').exists()).toBe(false)
    
    // Trigger expansion by clicking the expand icon
    await wrapper.find('.expand-icon').trigger('click')
    await wrapper.vm.$nextTick()
    
    // Now errors should be visible
    expect(wrapper.find('.error-list').exists()).toBe(true)
    const errorItems = wrapper.findAll('.error-item-compact')
    expect(errorItems).toHaveLength(3)
    expect(errorItems[0].find('.error-keyword').text()).toBe('required')
    expect(errorItems[0].find('.error-message').text()).toBe('is required')
    expect(errorItems[1].find('.error-keyword').text()).toBe('type')
    expect(errorItems[1].find('.error-message').text()).toBe('should be string')
  })

  it('emits continue-with-change when continue button clicked', async () => {
    const wrapper = mount(ValidationSection, {
      props: {
        errors: [],
        validationWarning: 'This change may cause issues'
      }
    })

    await wrapper.find('.warning-btn--continue').trigger('click')
    
    expect(wrapper.emitted('continue-with-change')).toHaveLength(1)
  })

  it('emits revert-change when revert button clicked', async () => {
    const wrapper = mount(ValidationSection, {
      props: {
        errors: [],
        validationWarning: 'This change may cause issues'
      }
    })

    await wrapper.find('.warning-btn--revert').trigger('click')
    
    expect(wrapper.emitted('revert-change')).toHaveLength(1)
  })
})