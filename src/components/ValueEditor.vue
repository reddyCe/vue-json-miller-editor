<template>
  <div v-if="!hasChildren" class="value-section">
    <div class="section-header">
      <span class="section-title">{{ options.locale?.editValue || 'Edit Value' }}</span>
    </div>

    <div class="value-editor-compact">
      <div class="editor-type-row">
        <select v-model="editType" class="type-selector" @change="convertValue">
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="null">Null</option>
        </select>
      </div>

      <div class="editor-value-row">
        <input
          v-if="editType !== 'boolean' && editType !== 'null'"
          v-model="editValue"
          :type="editType === 'number' ? 'number' : 'text'"
          class="value-input-wide"
          :placeholder="editType === 'string' ? 'Enter text...' : 'Enter number...'"
          @blur="updateValue"
          @keydown.enter="updateValue"
        />
        <select
          v-else-if="editType === 'boolean'"
          v-model="editValue"
          class="value-input-wide"
          @change="updateValue"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
        <div v-else class="null-display">null</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { JsonNode as JsonNodeType, JsonValue, JsonEditorOptions } from '../types'

interface Props {
  selectedItem: JsonNodeType | null
  options: JsonEditorOptions
}

interface Emits {
  (e: 'update-value', value: JsonValue, type: string): void
  (e: 'validation-warning', warning: string | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const editValue = ref('')
const editType = ref<'string' | 'number' | 'boolean' | 'null'>('string')

const hasChildren = computed(() => {
  if (!props.selectedItem) return false
  return props.selectedItem.type === 'object' || props.selectedItem.type === 'array'
})

function updateValue() {
  if (!props.selectedItem || hasChildren.value) return

  let newValue: JsonValue

  try {
    switch (editType.value) {
      case 'number':
        newValue = parseFloat(editValue.value)
        if (isNaN(newValue)) throw new Error('Invalid number')
        break
      case 'boolean':
        newValue = editValue.value === 'true'
        break
      case 'null':
        newValue = null
        break
      default:
        newValue = editValue.value
    }

    emit('update-value', newValue, editType.value)
  } catch {
    // Reset to original value on error
    editValue.value = String(props.selectedItem.value)
  }
}

function convertValue() {
  if (!props.selectedItem) return

  switch (editType.value) {
    case 'number':
      editValue.value = '0'
      break
    case 'boolean':
      editValue.value = 'false'
      break
    case 'null':
      editValue.value = ''
      break
    default:
      editValue.value = ''
  }
  updateValue()
}

// Update edit values when selected item changes
watch(() => props.selectedItem, (item) => {
  if (item && !hasChildren.value) {
    editValue.value = String(item.value)
    editType.value = item.type as 'string' | 'number' | 'boolean' | 'null'
  }
}, { immediate: true })
</script>

<style scoped>
.value-section {
  background: var(--miller-bg);
  border: 1px solid var(--miller-border-subtle);
  border-radius: 8px;
  overflow: hidden;
}

.section-header {
  background: var(--miller-header-bg);
  padding: 8px 12px;
  border-bottom: 1px solid var(--miller-border-subtle);
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--miller-text);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value-editor-compact {
  padding: 10px;
}

.editor-type-row {
  display: flex;
  margin-bottom: 8px;
}

.editor-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-selector {
  min-width: 80px;
  padding: 6px 8px;
  border: 1px solid var(--miller-border-subtle);
  border-radius: 4px;
  background: var(--miller-bg);
  color: var(--miller-text);
  font-size: 12px;
  font-weight: 500;
}

.value-input-wide {
  width: 100%;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid var(--miller-border-subtle);
  border-radius: 6px;
  background: var(--miller-bg);
  color: var(--miller-text);
  font-size: 16px;
  font-family: var(--miller-font-mono);
  transition: all 0.2s ease;
}

.value-input-wide:focus {
  outline: none;
  border-color: var(--miller-accent);
  box-shadow: 0 0 0 2px var(--miller-accent-bg);
}

.null-display {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--miller-border-subtle);
  border-radius: 6px;
  background: var(--miller-column-bg);
  color: var(--miller-text-subtle);
  font-size: 13px;
  font-family: var(--miller-font-mono);
  font-style: italic;
}
</style>
