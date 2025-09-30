import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import JsonMillerView from '../JsonMillerView.vue'
import type { JsonNode } from '@/types'
import { mergeOptions } from '@/utils/config'

describe('JsonMillerView Actions Section', () => {
  let mockNode: JsonNode

  beforeEach(() => {
    mockNode = {
      id: 'root',
      path: [],
      key: 'root',
      value: { name: 'test', obj: { prop: 'value' } },
      type: 'object',
      children: [
        {
          id: 'node1',
          path: ['name'],
          key: 'name',
          value: 'test',
          type: 'string'
        },
        {
          id: 'node2',
          path: ['obj'],
          key: 'obj',
          value: { prop: 'value' },
          type: 'object',
          children: [
            {
              id: 'node3',
              path: ['obj', 'prop'],
              key: 'prop',
              value: 'value',
              type: 'string'
            }
          ]
        }
      ]
    }
  })

  it('shows actions section when save button is enabled', async () => {
    const options = mergeOptions({
      editable: true,
      showSaveButton: true,
      showAddButton: false
    })

    const wrapper = mount(JsonMillerView, {
      props: {
        node: mockNode,
        validationErrors: [],
        options
      }
    })

    await nextTick()

    const actionsSection = wrapper.find('.actions-section')
    expect(actionsSection.exists()).toBe(true)

    wrapper.unmount()
  })

  it('hides actions section when both buttons are disabled', async () => {
    const options = mergeOptions({
      editable: true,
      showSaveButton: false,
      showAddButton: false
    })

    const wrapper = mount(JsonMillerView, {
      props: {
        node: mockNode,
        validationErrors: [],
        options
      }
    })

    await nextTick()

    const actionsSection = wrapper.find('.actions-section')
    expect(actionsSection.exists()).toBe(false)

    wrapper.unmount()
  })

  it('hides actions section when not editable', async () => {
    const options = mergeOptions({
      editable: false,
      showSaveButton: true,
      showAddButton: true
    })

    const wrapper = mount(JsonMillerView, {
      props: {
        node: mockNode,
        validationErrors: [],
        options
      }
    })

    await nextTick()

    const actionsSection = wrapper.find('.actions-section')
    expect(actionsSection.exists()).toBe(false)

    wrapper.unmount()
  })

  it('shows save button when enabled', async () => {
    const options = mergeOptions({
      editable: true,
      showSaveButton: true,
      showAddButton: false
    })

    const wrapper = mount(JsonMillerView, {
      props: {
        node: mockNode,
        validationErrors: [],
        options
      }
    })

    await nextTick()

    const saveButton = wrapper.find('.save-btn')
    expect(saveButton.exists()).toBe(true)

    wrapper.unmount()
  })

  it('hides save button when disabled', async () => {
    const options = mergeOptions({
      editable: true,
      showSaveButton: false,
      showAddButton: true
    })

    const wrapper = mount(JsonMillerView, {
      props: {
        node: mockNode,
        validationErrors: [],
        options
      }
    })

    await nextTick()

    const saveButton = wrapper.find('.save-btn')
    expect(saveButton.exists()).toBe(false)

    wrapper.unmount()
  })
})
