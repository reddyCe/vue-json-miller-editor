<template>
  <div class="json-node" :class="nodeClasses">
    <div class="json-node__line" :style="{ paddingLeft: `${depth * (options.indentSize || 20)}px` }">
      <!-- Collapse/Expand toggle for containers -->
      <button
        v-if="hasChildren"
        class="json-node__toggle"
        @click="toggleCollapse"
        :aria-expanded="!node.isCollapsed"
      >
        <span class="json-node__toggle-icon" :class="{ collapsed: node.isCollapsed }">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </button>
      
      <!-- Empty space for alignment when no toggle -->
      <div v-else class="json-node__toggle-spacer"></div>
      
      <!-- Type indicator -->
      <span class="json-node__type-indicator" :class="`json-node__type-indicator--${node.type}`">
        {{ typeIcon }}
      </span>
      
      <!-- Key/Index -->
      <span class="json-node__key" @click="selectNode" :class="keyClasses">
        {{ displayKey }}
      </span>
      
      <span v-if="!hasChildren || isEditingValue" class="json-node__colon">:</span>
      
      <!-- Value -->
      <div class="json-node__value-container">
        <!-- Editable primitive values -->
        <input
          v-if="isEditingValue"
          v-model="editValue"
          class="json-node__input"
          :type="inputType"
          @keydown.enter="saveEdit"
          @keydown.escape="cancelEdit"
          @blur="saveEdit"
          ref="editInput"
        />
        
        <!-- Display value -->
        <span
          v-else
          class="json-node__value"
          :class="valueClasses"
          @click="startEdit"
          :title="valueTooltip"
        >
          {{ displayValue }}
        </span>
        
        <!-- Special value preview -->
        <div v-if="specialValuePreview" class="json-node__preview">
          {{ specialValuePreview }}
        </div>
        
        <!-- Container summary -->
        <span v-if="hasChildren && node.isCollapsed" class="json-node__summary">
          {{ containerSummary }}
        </span>
        
        <!-- Actions for objects/arrays -->
        <div v-if="options.editable && !node.isCollapsed && hasChildren" class="json-node__actions">
          <button
            v-if="node.type === 'object'"
            class="json-node__action-btn"
            @click="showAddProperty = true"
            title="Add property"
          >
            <span class="icon">+</span>
          </button>
          
          <button
            v-if="node.type === 'array'"
            class="json-node__action-btn"
            @click="addArrayItem"
            title="Add item"
          >
            <span class="icon">+</span>
          </button>
        </div>
        
        <!-- Delete button for individual items -->
        <button
          v-if="options.editable && canDelete"
          class="json-node__delete-btn"
          @click="deleteNode"
          title="Delete"
        >
          <span class="icon">×</span>
        </button>
      </div>
      
      <!-- Validation error indicator -->
      <span
        v-if="hasValidationError"
        class="json-node__error-indicator"
        :title="validationErrorMessage"
      >
        <span class="icon">⚠️</span>
      </span>
    </div>
    
    <!-- Add property form -->
    <div v-if="showAddProperty" class="json-node__add-form">
      <input
        v-model="newPropertyKey"
        placeholder="Property name"
        class="json-node__add-input"
        @keydown.enter="addProperty"
        @keydown.escape="cancelAddProperty"
      />
      <select v-model="newPropertyType" class="json-node__add-select">
        <option value="string">String</option>
        <option value="number">Number</option>
        <option value="boolean">Boolean</option>
        <option value="null">Null</option>
        <option value="object">Object</option>
        <option value="array">Array</option>
      </select>
      <button @click="addProperty" class="json-node__add-btn">Add</button>
      <button @click="cancelAddProperty" class="json-node__add-btn">Cancel</button>
    </div>
    
    <!-- Children -->
    <div v-if="hasChildren && !node.isCollapsed" class="json-node__children">
      <JsonNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :validation-errors="validationErrors"
        :options="options"
        :depth="depth + 1"
        @update-value="$emit('update-value', $event)"
        @add-property="$emit('add-property', $event)"
        @remove-node="$emit('remove-node', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import type { JsonNode as JsonNodeType, ValidationError, JsonEditorOptions, JsonValue, JsonPath } from '../types'

interface Props {
  node: JsonNodeType
  validationErrors: ValidationError[]
  options: JsonEditorOptions
  depth?: number
}

interface Emits {
  (e: 'update-value', event: { path: JsonPath; value: JsonValue }): void
  (e: 'add-property', event: { path: JsonPath; key: string; value: JsonValue }): void
  (e: 'remove-node', path: JsonPath): void
  (e: 'toggle-collapse', nodeId: string, collapsed: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0
})
const emit = defineEmits<Emits>()

const isEditingValue = ref(false)
const editValue = ref('')
const showAddProperty = ref(false)
const newPropertyKey = ref('')
const newPropertyType = ref('string')
const editInput = ref<HTMLInputElement>()

const hasChildren = computed(() => 
  props.node.type === 'object' || props.node.type === 'array'
)

const canDelete = computed(() => 
  props.node.path.length > 0
)

const nodeClasses = computed(() => ({
  [`json-node--${props.node.type}`]: true,
  'json-node--collapsed': props.node.isCollapsed,
  'json-node--has-error': hasValidationError.value
}))

const typeIcon = computed(() => {
  switch (props.node.type) {
    case 'string': return '""'
    case 'number': return '#'
    case 'boolean': return props.node.value ? '✓' : '✗'
    case 'null': return '∅'
    case 'object': return '{ }'
    case 'array': return '[ ]'
    default: return '?'
  }
})

const keyClasses = computed(() => ({
  'json-node__key--array-index': typeof props.node.key === 'number',
  'json-node__key--object-key': typeof props.node.key === 'string'
}))

const displayKey = computed(() => {
  if (typeof props.node.key === 'number') {
    return props.node.key.toString()
  }
  return props.node.key.toString()
})

const displayValue = computed(() => {
  if (hasChildren.value) {
    return ''
  }
  
  if (props.node.type === 'string') {
    return `"${props.node.value}"`
  }
  if (props.node.type === 'null') {
    return 'null'
  }
  return String(props.node.value)
})

const specialValuePreview = computed(() => {
  if (props.node.type === 'string') {
    const str = props.node.value as string
    
    if (props.options.detectSpecialStrings?.date && isDateString(str)) {
      return new Date(str).toLocaleString()
    }
    if (props.options.detectSpecialStrings?.url && isUrlString(str)) {
      return '🔗 Link'
    }
    if (props.options.detectSpecialStrings?.image && isImageUrl(str)) {
      return '🖼️ Image'
    }
    if (props.options.detectSpecialStrings?.color && isColorString(str)) {
      return `🎨 ${str}`
    }
  }
  return null
})

const valueClasses = computed(() => ({
  [`json-node__value--${props.node.type}`]: true,
  'json-node__value--editable': props.options.editable && !hasChildren.value
}))

const inputType = computed(() => {
  switch (props.node.type) {
    case 'number': return 'number'
    case 'boolean': return 'checkbox'
    default: return 'text'
  }
})

const valueTooltip = computed(() => {
  if (props.node.type === 'string') {
    const str = props.node.value as string
    if (props.options.detectSpecialStrings?.date && isDateString(str)) {
      return `Date: ${new Date(str).toLocaleString()}`
    }
    if (props.options.detectSpecialStrings?.url && isUrlString(str)) {
      return `URL: ${str}`
    }
  }
  return undefined
})

const containerSummary = computed(() => {
  if (props.node.type === 'array') {
    const length = (props.node.value as JsonValue[]).length
    return `] (${length} item${length !== 1 ? 's' : ''})`
  }
  if (props.node.type === 'object') {
    const keys = Object.keys(props.node.value as Record<string, JsonValue>)
    return `} (${keys.length} propert${keys.length !== 1 ? 'ies' : 'y'})`
  }
  return ''
})

// Toggle icon class (currently not used in template)
// const toggleIconClass = computed(() => ({
//   'json-node__toggle-icon': true,
//   'json-node__toggle-icon--collapsed': props.node.isCollapsed
// }))

const hasValidationError = computed(() => 
  props.validationErrors.some(error => 
    JSON.stringify(error.path) === JSON.stringify(props.node.path)
  )
)

const validationErrorMessage = computed(() => {
  const error = props.validationErrors.find(error => 
    JSON.stringify(error.path) === JSON.stringify(props.node.path)
  )
  return error?.message || ''
})

function toggleCollapse() {
  // Emit event instead of mutating prop directly
  emit('toggle-collapse', props.node.id, !props.node.isCollapsed)
}

function selectNode() {
  // TODO: Implement node selection
}

function startEdit() {
  if (!props.options.editable || hasChildren.value) return
  
  isEditingValue.value = true
  editValue.value = props.node.type === 'string' 
    ? props.node.value as string
    : String(props.node.value)
  
  nextTick(() => {
    editInput.value?.focus()
    editInput.value?.select()
  })
}

function saveEdit() {
  if (!isEditingValue.value) return
  
  let newValue: JsonValue
  
  try {
    switch (props.node.type) {
      case 'number':
        newValue = parseFloat(editValue.value)
        if (isNaN(newValue)) throw new Error('Invalid number')
        break
      case 'boolean':
        newValue = editValue.value === 'true' || editValue.value === '1'
        break
      case 'null':
        newValue = null
        break
      default:
        newValue = editValue.value
    }
    
    emit('update-value', { path: props.node.path, value: newValue })
  } catch {
    // Reset to original value on error
    editValue.value = String(props.node.value)
  }
  
  isEditingValue.value = false
}

function cancelEdit() {
  isEditingValue.value = false
  editValue.value = String(props.node.value)
}

function addProperty() {
  if (!newPropertyKey.value.trim()) return
  
  let value: JsonValue
  switch (newPropertyType.value) {
    case 'number': value = 0; break
    case 'boolean': value = false; break
    case 'null': value = null; break
    case 'object': value = {}; break
    case 'array': value = []; break
    default: value = ''
  }
  
  emit('add-property', {
    path: props.node.path,
    key: newPropertyKey.value,
    value
  })
  
  cancelAddProperty()
}

function addArrayItem() {
  emit('add-property', {
    path: props.node.path,
    key: String((props.node.value as JsonValue[]).length),
    value: ''
  })
}

function cancelAddProperty() {
  showAddProperty.value = false
  newPropertyKey.value = ''
  newPropertyType.value = 'string'
}

function deleteNode() {
  if (!canDelete.value) return
  emit('remove-node', props.node.path)
}

function isDateString(str: string): boolean {
  const date = new Date(str)
  return !isNaN(date.getTime()) && str.includes('T')
}

function isUrlString(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

function isImageUrl(str: string): boolean {
  if (!isUrlString(str)) return false
  return /\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)$/i.test(str)
}

function isColorString(str: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(str) ||
         /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(str) ||
         /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i.test(str)
}

watch(() => props.node.isCollapsed, (collapsed) => {
  if (!collapsed && showAddProperty.value) {
    showAddProperty.value = false
  }
})
</script>

<style scoped>
.json-node {
  position: relative;
}

.json-node__line {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 20px;
  min-height: 32px;
  border-radius: 4px;
  transition: all 0.15s ease;
  position: relative;
}

.json-node__line:hover {
  background: var(--json-editor-hover-bg, rgba(59, 130, 246, 0.04));
}

.json-node__toggle {
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--json-editor-text-muted, #718096);
  transition: all 0.15s ease;
}

.json-node__toggle:hover {
  background: var(--json-editor-button-hover-bg, #f1f5f9);
  color: var(--json-editor-text-color, #1a202c);
}

.json-node__toggle-spacer {
  width: 20px;
  height: 20px;
}

.json-node__toggle-icon {
  transition: transform 0.2s ease;
}

.json-node__toggle-icon.collapsed {
  transform: rotate(0deg);
}

.json-node__toggle-icon:not(.collapsed) {
  transform: rotate(90deg);
}

.json-node__type-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 3px;
  flex-shrink: 0;
}

.json-node__type-indicator--string {
  background: var(--json-type-string-bg, #dcfce7);
  color: var(--json-type-string-color, #166534);
}

.json-node__type-indicator--number {
  background: var(--json-type-number-bg, #dbeafe);
  color: var(--json-type-number-color, #1e40af);
}

.json-node__type-indicator--boolean {
  background: var(--json-type-boolean-bg, #f3e8ff);
  color: var(--json-type-boolean-color, #7c3aed);
}

.json-node__type-indicator--null {
  background: var(--json-type-null-bg, #f1f5f9);
  color: var(--json-type-null-color, #64748b);
}

.json-node__type-indicator--object {
  background: var(--json-type-object-bg, #fef3c7);
  color: var(--json-type-object-color, #92400e);
}

.json-node__type-indicator--array {
  background: var(--json-type-array-bg, #fee2e2);
  color: var(--json-type-array-color, #dc2626);
}

.json-node__key {
  font-weight: 500;
  color: var(--json-node-key-color, #374151);
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.json-node__key--array-index {
  color: var(--json-node-index-color, #6b7280);
  font-family: var(--json-editor-font-family, monospace);
}

.json-node__key:hover {
  color: var(--json-editor-button-active-bg, #3b82f6);
}

.json-node__colon {
  color: var(--json-editor-text-muted, #6b7280);
  font-weight: 500;
  flex-shrink: 0;
}

.json-node__value-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.json-node__value {
  font-family: var(--json-editor-font-family, monospace);
  word-break: break-all;
  cursor: default;
  flex: 1;
}

.json-node__value--editable {
  cursor: text;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.json-node__value--editable:hover {
  background: var(--json-editor-hover-bg, #f8fafc);
  border-color: var(--json-editor-border-color, #e2e8f0);
}

.json-node__value--string {
  color: var(--json-node-string-color, #059669);
}

.json-node__value--number {
  color: var(--json-node-number-color, #2563eb);
  font-weight: 500;
}

.json-node__value--boolean {
  color: var(--json-node-boolean-color, #7c3aed);
  font-weight: 600;
}

.json-node__value--null {
  color: var(--json-node-null-color, #6b7280);
  font-style: italic;
}

.json-node__preview {
  font-size: 11px;
  color: var(--json-editor-text-muted, #6b7280);
  background: var(--json-editor-button-bg, #f8fafc);
  padding: 2px 6px;
  border-radius: 3px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.json-node__input {
  padding: 4px 8px;
  border: 1px solid var(--json-editor-button-active-bg, #3b82f6);
  border-radius: 4px;
  background: var(--json-editor-bg, #ffffff);
  color: var(--json-editor-text-color, #1a202c);
  font-family: var(--json-editor-font-family, monospace);
  font-size: inherit;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.json-node__summary {
  color: var(--json-editor-text-muted, #6b7280);
  font-size: 12px;
  font-weight: 500;
  margin-left: 8px;
}

.json-node__actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.json-node__line:hover .json-node__actions,
.json-node__line:hover .json-node__delete-btn {
  opacity: 1;
}

.json-node__action-btn,
.json-node__delete-btn {
  width: 24px;
  height: 24px;
  border: 1px solid var(--json-editor-border-color, #e2e8f0);
  border-radius: 4px;
  background: var(--json-editor-button-bg, #f8fafc);
  color: var(--json-editor-text-color, #374151);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  transition: all 0.15s ease;
  opacity: 0;
}

.json-node__action-btn:hover {
  background: var(--json-editor-button-hover-bg, #f1f5f9);
  border-color: var(--json-editor-button-active-bg, #3b82f6);
}

.json-node__delete-btn {
  color: #dc2626;
}

.json-node__delete-btn:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

.json-node__error-indicator {
  color: #dc2626;
  font-size: 16px;
  cursor: help;
  opacity: 0.8;
}

.json-node__add-form {
  display: flex;
  gap: 8px;
  margin: 8px 20px;
  padding: 12px;
  background: var(--json-editor-button-bg, #f8fafc);
  border-radius: 6px;
  border: 1px solid var(--json-editor-border-color, #e2e8f0);
}

.json-node__add-input,
.json-node__add-select {
  padding: 6px 10px;
  border: 1px solid var(--json-editor-border-color, #e2e8f0);
  border-radius: 4px;
  background: var(--json-editor-bg, #ffffff);
  color: var(--json-editor-text-color, #1a202c);
  font-family: inherit;
  font-size: 12px;
  outline: none;
}

.json-node__add-input:focus,
.json-node__add-select:focus {
  border-color: var(--json-editor-button-active-bg, #3b82f6);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.json-node__add-btn {
  padding: 6px 12px;
  border: 1px solid var(--json-editor-border-color, #e2e8f0);
  border-radius: 4px;
  background: var(--json-editor-button-bg, #f8fafc);
  color: var(--json-editor-text-color, #1a202c);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.json-node__add-btn:hover {
  background: var(--json-editor-button-hover-bg, #f1f5f9);
  border-color: var(--json-editor-button-active-bg, #3b82f6);
}

.json-node__children {
  position: relative;
}

.json-node__children::before {
  content: '';
  position: absolute;
  left: 29px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--json-editor-border-color, #e2e8f0);
}

/* Dark theme adjustments */
.json-editor--dark {
  --json-type-string-bg: #064e3b;
  --json-type-string-color: #6ee7b7;
  --json-type-number-bg: #1e3a8a;
  --json-type-number-color: #93c5fd;
  --json-type-boolean-bg: #581c87;
  --json-type-boolean-color: #d8b4fe;
  --json-type-null-bg: #374151;
  --json-type-null-color: #9ca3af;
  --json-type-object-bg: #92400e;
  --json-type-object-color: #fbbf24;
  --json-type-array-bg: #991b1b;
  --json-type-array-color: #fca5a5;
  --json-node-key-color: #f3f4f6;
  --json-node-index-color: #9ca3af;
  --json-node-string-color: #6ee7b7;
  --json-node-number-color: #93c5fd;
  --json-node-boolean-color: #d8b4fe;
  --json-node-null-color: #9ca3af;
}
</style>