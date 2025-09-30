<template>
  <div v-if="show" class="add-form-compact">
    <div class="form-header">
      <span>{{ options.locale?.addNew || 'Add new' }} {{ parentType === 'array' ? (options.locale?.item || 'item') : (options.locale?.property || 'property') }}</span>
      <button @click="cancel" class="close-btn">×</button>
    </div>
    
    <div class="form-body">
      <input 
        v-if="parentType === 'object'"
        v-model="newKey" 
        :placeholder="options.locale?.propertyName || 'Property name'" 
        class="form-input compact" 
      />
      
      <div class="form-row">
        <select v-model="newType" class="form-select compact">
          <option value="string">{{ options.locale?.stringType || 'String' }}</option>
          <option value="number">{{ options.locale?.numberType || 'Number' }}</option>
          <option value="boolean">{{ options.locale?.booleanType || 'Boolean' }}</option>
          <option value="null">{{ options.locale?.nullType || 'Null' }}</option>
          <option value="object">{{ options.locale?.objectType || 'Object' }}</option>
          <option value="array">{{ options.locale?.arrayType || 'Array' }}</option>
        </select>
        <button @click="addItem" class="form-btn primary compact">{{ options.locale?.add || 'Add' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { JsonValue, JsonEditorOptions } from '../types'

interface Props {
  show: boolean
  parentType: 'object' | 'array'
  parentChildrenLength?: number
  options: Required<JsonEditorOptions>
}

interface Emits {
  (e: 'add-item', key: string | number, value: JsonValue): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const newKey = ref('')
const newType = ref('string')

function addItem() {
  let value: JsonValue
  switch (newType.value) {
    case 'number': value = 0; break
    case 'boolean': value = false; break
    case 'null': value = null; break
    case 'object': value = {}; break
    case 'array': value = []; break
    default: value = ''
  }

  const key = props.parentType === 'array'
    ? (props.parentChildrenLength || 0)
    : newKey.value

  emit('add-item', key, value)
  resetForm()
}

function cancel() {
  emit('cancel')
  resetForm()
}

function resetForm() {
  newKey.value = ''
  newType.value = 'string'
}

// Reset form when show changes
watch(() => props.show, (show) => {
  if (!show) {
    resetForm()
  }
})
</script>

<style scoped>
.add-form-compact {
  border-top: 1px solid var(--miller-border-subtle);
  background: var(--miller-hover);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--miller-header-bg);
  border-bottom: 1px solid var(--miller-border-subtle);
  font-size: 12px;
  font-weight: 600;
  color: var(--miller-text);
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--miller-text-subtle);
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
}

.close-btn:hover {
  background: var(--miller-border-subtle);
  color: var(--miller-text);
}

.form-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.form-input.compact, .form-select.compact {
  padding: 6px 8px;
  border: 1px solid var(--miller-border-subtle);
  border-radius: 4px;
  font-size: 12px;
  background: var(--miller-bg);
  color: var(--miller-text);
  transition: all 0.2s ease;
}

.form-input.compact:focus,
.form-select.compact:focus {
  outline: none;
  border-color: var(--miller-selected);
  box-shadow: 0 0 0 3px var(--miller-selected-bg);
}

.form-select.compact {
  flex: 1;
}

.form-btn.compact {
  padding: 6px 12px;
  border: 1px solid var(--miller-border-subtle);
  border-radius: 4px;
  font-size: 12px;
  min-width: 60px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--miller-column-bg);
  color: var(--miller-text);
}

.form-btn.primary.compact {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  font-weight: 600;
}

.form-btn.primary.compact:hover {
  background: #2563eb;
  border-color: #2563eb;
}
</style>