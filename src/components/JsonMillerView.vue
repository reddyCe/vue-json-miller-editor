<template>
  <div class="json-miller" :class="themeClass">
    <!-- Miller Columns -->
    <div class="miller-columns">
      <div 
        v-for="(column, index) in columns" 
        :key="index"
        class="miller-column"
      >
        <div class="column-header">
          {{ getColumnTitle(column, index) }}
        </div>
        <div class="column-content">
          <div
            v-for="item in column.items"
            :key="item.id"
            class="column-item"
            :class="{ 
              selected: isSelected(item, index),
              'has-children': hasChildren(item)
            }"
            @click="selectItem(item, index)"
          >
            <span class="item-icon type-indicator" :class="`type-indicator--${item.type}`">{{ getItemIcon(item) }}</span>
            <span class="item-name">{{ getItemName(item) }}</span>
            <span v-if="hasChildren(item)" class="item-arrow">▶</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Value Inspector -->
    <div class="value-inspector">
      <div class="inspector-header">
        <span>Inspector</span>
      </div>
      
      <div v-if="selectedItem" class="inspector-content">
        <!-- Item Header -->
        <div class="item-header">
          <div class="item-header-main">
            <div class="item-icon-compact type-indicator" :class="`type-indicator--${selectedItem.type}`">
              {{ getItemIcon(selectedItem) }}
            </div>
            <div class="item-header-text">
              <div class="item-title">{{ getItemName(selectedItem) }}</div>
              <div class="item-meta">
                <span class="item-type-badge" :class="`type-badge--${selectedItem.type}`">{{ selectedItem.type }}</span>
                <span class="item-path-compact">{{ getCompactPath() }}</span>
              </div>
            </div>
          </div>
          <div v-if="hasChildren(selectedItem)" class="item-stats">
            <div class="stat-badge">
              {{ selectedItem.children?.length || 0 }} {{ selectedItem.type === 'array' ? 'items' : 'props' }}
            </div>
          </div>
        </div>

        <!-- Value Editor -->
        <div v-if="!hasChildren(selectedItem)" class="value-section">
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

        <!-- Actions -->
        <div v-if="shouldShowActionsSection" class="actions-section">
          <div class="section-header">
            <span class="section-title">Actions</span>
          </div>
          
          <div class="action-grid">
            <button 
              v-if="hasChildren(selectedItem) && options.showAddButton"
              class="action-btn add-btn"
              @click="showAddForm = true"
            >
              <span class="btn-icon">+</span>
              {{ selectedItem.type === 'array' ? (options.locale?.addItem || 'Add Item') : (options.locale?.addProperty || 'Add Property') }}
            </button>
            <button 
              v-if="options.showSaveButton"
              class="action-btn save-btn"
              :disabled="!hasUnsavedChanges"
              @click="showDiffModal = true"
            >
              <span class="save-icon">💾</span>
              <span class="save-text">{{ options.locale?.saveChanges || 'Save Changes' }}</span>
              <span v-if="pendingChanges.length > 0" class="save-badge">{{ pendingChanges.length }}</span>
            </button>
          </div>

          <!-- Compact Add Form -->
          <div v-if="showAddForm" class="add-form-compact">
            <div class="form-header">
              <span>Add new {{ selectedItem.type === 'array' ? 'item' : 'property' }}</span>
              <button @click="cancelAdd" class="close-btn">×</button>
            </div>
            
            <div class="form-body">
              <input 
                v-if="selectedItem.type === 'object'"
                v-model="newKey" 
                placeholder="Property name" 
                class="form-input compact" 
              />
              
              <div class="form-row">
                <select v-model="newType" class="form-select compact">
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="null">Null</option>
                  <option value="object">Object</option>
                  <option value="array">Array</option>
                </select>
                <button @click="addItem" class="form-btn primary compact">Add</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Validation Errors -->
        <div v-if="itemErrors.length > 0" class="errors-section">
          <div class="section-header">
            <span class="section-title">Validation Errors</span>
          </div>
          <div class="errors-content">
            <div v-for="error in itemErrors" :key="error.message" class="error-item">
              <span class="error-icon">⚠</span>
              {{ error.message }}
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-inspector">
        <div class="empty-icon">📄</div>
        <div class="empty-text">Select an item to view details</div>
      </div>
    </div>

    <!-- Diff Modal -->
    <div v-if="showDiffModal" class="diff-modal-overlay" @click="closeDiffModal">
      <div class="diff-modal" @click.stop>
        <div class="diff-modal__header">
          <h3>Review Changes</h3>
          <button class="close-btn" @click="closeDiffModal">×</button>
        </div>
        
        <div class="diff-modal__content">
          <div class="diff-summary">
            <span class="diff-count">{{ pendingChanges.length }} change(s) pending</span>
          </div>
          
          <div class="diff-list">
            <div v-for="(change, index) in pendingChanges" :key="index" class="diff-item">
              <div class="diff-path">
                <span class="path-icon">📍</span>
                <code>{{ change.path.length === 0 ? 'root' : change.path.join('.') }}</code>
              </div>
              
              <div class="diff-change">
                <div class="diff-before">
                  <span class="diff-label">Before:</span>
                  <code class="diff-value diff-value--old">{{ formatValue(change.oldValue as JsonValue) }}</code>
                </div>
                <div class="diff-arrow">→</div>
                <div class="diff-after">
                  <span class="diff-label">After:</span>
                  <code class="diff-value diff-value--new">{{ formatValue(change.newValue as JsonValue) }}</code>
                </div>
              </div>
              
              <div class="diff-type">
                <span class="change-type" :class="`change-type--${change.type}`">
                  {{ change.type.toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="diff-modal__footer">
          <button class="modal-btn modal-btn--secondary" @click="closeDiffModal">
            {{ options.locale?.cancel || 'Cancel' }}
          </button>
          <button class="modal-btn modal-btn--primary" @click="saveAllChanges">
            ✓ {{ options.locale?.saveChanges || 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { 
  JsonNode as JsonNodeType, 
  ValidationError, 
  JsonEditorOptions, 
  JsonValue, 
  JsonPath 
} from '../types'
import { treeToJson } from '../utils/json-model'

interface PendingChange {
  type: string
  path: JsonPath
  oldValue?: JsonValue
  newValue?: JsonValue
}

interface Props {
  node: JsonNodeType | null
  validationErrors: ValidationError[]
  options: JsonEditorOptions
}

interface Emits {
  (e: 'update-value', path: JsonPath, value: JsonValue): void
  (e: 'add-property', path: JsonPath, key: string, value: JsonValue): void
  (e: 'remove-node', path: JsonPath): void
  (e: 'save', changes: PendingChange[], finalValue: JsonValue): void
  (e: 'change'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedPath = ref<JsonNodeType[]>([])
const editValue = ref('')
const editType = ref<'string' | 'number' | 'boolean' | 'null'>('string')
const showAddForm = ref(false)
const newKey = ref('')
const newType = ref('string')
const showDiffModal = ref(false)
const pendingChanges = ref<PendingChange[]>([])
const originalData = ref<any>(null) // JsonValue type causes TS recursion issues

const themeClass = computed(() => `json-miller--${props.options.theme || 'light'}`)

const columns = computed(() => {
  const cols: Array<{ items: JsonNodeType[], selectedIndex?: number }> = []
  
  if (!props.node) return cols

  // First column - root children
  cols.push({
    items: props.node.children || [],
    selectedIndex: selectedPath.value.length > 0 ? 
      (props.node.children || []).findIndex(child => child.id === selectedPath.value[0]?.id) : 
      undefined
  })

  // Build subsequent columns based on selection path
  let currentNode = props.node
  for (let i = 0; i < selectedPath.value.length; i++) {
    const selected = selectedPath.value[i]
    const child = currentNode.children?.find(c => c.id === selected.id)
    
    if (child && hasChildren(child)) {
      cols.push({
        items: child.children || [],
        selectedIndex: i + 1 < selectedPath.value.length ?
          (child.children || []).findIndex(c => c.id === selectedPath.value[i + 1]?.id) :
          undefined
      })
      currentNode = child
    } else {
      break
    }
  }

  return cols
})

const selectedItem = computed((): JsonNodeType | null => {
  if (selectedPath.value.length === 0) return props.node
  return selectedPath.value[selectedPath.value.length - 1] || null
})

const hasUnsavedChanges = computed(() => {
  return pendingChanges.value.length > 0
})

const currentJsonData = computed(() => {
  return props.node ? treeToJson(props.node) : null
})

const itemErrors = computed(() => {
  if (!selectedItem.value) return []
  return props.validationErrors.filter(error =>
    JSON.stringify(error.path) === JSON.stringify(selectedItem.value!.path)
  )
})

const shouldShowActionsSection = computed(() => {
  if (!props.options.editable) return false
  
  // Save button shows if enabled
  const showSaveButton = props.options.showSaveButton
  
  // Add button shows if enabled AND we have a selected item that has children
  const showAddButton = props.options.showAddButton && 
                       selectedItem.value && 
                       hasChildren(selectedItem.value)
  
  return showSaveButton || showAddButton
})

function hasChildren(item: JsonNodeType): boolean {
  return item.type === 'object' || item.type === 'array'
}

function getItemIcon(item: JsonNodeType): string {
  switch (item.type) {
    case 'object': return '{ }'
    case 'array': return '[ ]'
    case 'string': return '"'
    case 'number': return '#'
    case 'boolean': return '✓'
    case 'null': return '∅'
    default: return '📄'
  }
}

function getItemName(item: JsonNodeType): string {
  return String(item.key)
}

function getColumnTitle(column: { items: JsonNodeType[], selectedIndex?: number }, index: number): string {
  if (index === 0) return 'Root'
  if (selectedPath.value[index - 1]) {
    return getItemName(selectedPath.value[index - 1] as JsonNodeType)
  }
  return 'Items'
}

// Unused function - keeping for potential future use
// function getItemPath(): string {
//   if (!selectedItem.value) return ''
//   return selectedItem.value.path.length === 0 ? 'root' : selectedItem.value.path.join('.')
// }

function getCompactPath(): string {
  if (!selectedItem.value) return ''
  const path = selectedItem.value.path
  if (path.length === 0) return 'root'
  if (path.length <= 3) return path.join(' › ')
  return `...${path.slice(-2).join(' › ')}`
}

function isSelected(item: JsonNodeType, columnIndex: number): boolean {
  return selectedPath.value[columnIndex]?.id === item.id
}

function selectItem(item: JsonNodeType, columnIndex: number) {
  // Truncate selection path at this column and add the new selection
  selectedPath.value = selectedPath.value.slice(0, columnIndex)
  selectedPath.value.push(item as JsonNodeType)

  // Update edit values
  if (!hasChildren(item)) {
    editValue.value = String(item.value)
    editType.value = item.type as 'string' | 'number' | 'boolean' | 'null'
  }

  // Auto-scroll to show new column if item has children
  if (hasChildren(item)) {
    // Use nextTick to ensure the new column is rendered
    setTimeout(() => {
      autoScrollToColumn(columnIndex + 1)
    }, 100)
  }
}

function autoScrollToColumn(targetColumnIndex: number) {
  const columnsContainer = document.querySelector('.miller-columns') as HTMLElement
  if (!columnsContainer) return

  const targetColumn = columnsContainer.children[targetColumnIndex] as HTMLElement
  if (!targetColumn) return

  const containerRect = columnsContainer.getBoundingClientRect()
  
  // Calculate if the target column is fully visible
  const targetLeft = targetColumn.offsetLeft
  const targetRight = targetLeft + targetColumn.offsetWidth
  const currentScrollLeft = columnsContainer.scrollLeft
  const visibleLeft = currentScrollLeft
  const visibleRight = currentScrollLeft + containerRect.width

  // Only scroll if the target column is not fully visible
  if (targetRight > visibleRight || targetLeft < visibleLeft) {
    let scrollLeft: number
    
    // If we can fit the entire column, center it
    if (targetColumn.offsetWidth <= containerRect.width) {
      scrollLeft = targetLeft - (containerRect.width - targetColumn.offsetWidth) / 2
    } else {
      // If column is wider than container, align to left
      scrollLeft = targetLeft - 20 // Small padding
    }
    
    // Ensure we don't scroll past the boundaries
    const maxScrollLeft = columnsContainer.scrollWidth - containerRect.width
    scrollLeft = Math.max(0, Math.min(scrollLeft, maxScrollLeft))
    
    columnsContainer.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    })
  }
}

function updateValue() {
  if (!selectedItem.value || hasChildren(selectedItem.value)) return

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

    // Track the change instead of immediately updating
    trackChange(selectedItem.value.path, selectedItem.value.value, newValue, 'update')
  } catch {
    // Reset to original value on error
    editValue.value = String(selectedItem.value.value)
  }
}

function convertValue() {
  if (!selectedItem.value) return

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

function addItem() {
  if (!selectedItem.value) return

  let value: JsonValue
  switch (newType.value) {
    case 'number': value = 0; break
    case 'boolean': value = false; break
    case 'null': value = null; break
    case 'object': value = {}; break
    case 'array': value = []; break
    default: value = ''
  }

  const key = selectedItem.value.type === 'array'
    ? (selectedItem.value.children?.length || 0)
    : newKey.value

  // Track the addition
  const newPath = [...selectedItem.value.path, key]
  trackChange(newPath, undefined, value, 'add')
  cancelAdd()
}

function trackChange(path: JsonPath, oldValue: JsonValue | undefined, newValue: JsonValue, type: 'update' | 'add' | 'delete') {
  // Remove any existing change for this path
  const existingIndex = pendingChanges.value.findIndex(change => 
    JSON.stringify(change.path) === JSON.stringify(path)
  )
  
  if (existingIndex !== -1) {
    pendingChanges.value.splice(existingIndex, 1)
  }
  
  // Add the new change
  pendingChanges.value.push({
    path: [...path],
    oldValue,
    newValue,
    type
  })
  
  // Emit change event immediately when any edit is made
  emit('change')
}

function formatValue(value: JsonValue): string {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'object') {
    return Array.isArray(value) ? `[${value.length} items]` : `{${Object.keys(value).length} props}`
  }
  return String(value)
}

function closeDiffModal() {
  showDiffModal.value = false
}

// Helper function to set a value at a specific path in JSON
function setValueAtPath(obj: Record<string, JsonValue> | JsonValue[], path: JsonPath, value: JsonValue) {
  let current: any = obj // Using any here for dynamic property access
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (!(key in current)) {
      // Create new object/array as needed
      current[key] = typeof path[i + 1] === 'number' ? [] : {}
    }
    current = current[key]
  }
  current[path[path.length - 1]] = value
}

// Helper function to delete a value at a specific path in JSON
function deleteValueAtPath(obj: Record<string, JsonValue> | JsonValue[], path: JsonPath) {
  if (path.length === 0) return
  
  let current: any = obj // Using any here for dynamic property access
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]]
    if (current === undefined) return
  }
  
  const lastKey = path[path.length - 1]
  if (Array.isArray(current)) {
    current.splice(Number(lastKey), 1)
  } else {
    delete current[lastKey]
  }
}

function saveAllChanges() {
  if (pendingChanges.value.length === 0) return
  
  // Get current JSON value and apply changes to calculate final value
  const finalJson = JSON.parse(JSON.stringify(treeToJson(props.node!))) // props.node is guaranteed to exist here
  
  // Apply all changes to calculate the final JSON
  for (const change of pendingChanges.value) {
    switch (change.type) {
      case 'update':
        setValueAtPath(finalJson, change.path, change.newValue)
        break
      case 'add':
        setValueAtPath(finalJson, change.path, change.newValue)
        break
      case 'delete':
        deleteValueAtPath(finalJson, change.path)
        break
    }
  }
  
  // Emit save event with changes and final calculated value
  emit('save', [...pendingChanges.value], finalJson)
  
  // Apply all pending changes to the actual tree
  for (const change of pendingChanges.value) {
    switch (change.type) {
      case 'update':
        emit('update-value', change.path, change.newValue as JsonValue)
        break
      case 'add':
        const parentPath = change.path.slice(0, -1)
        const key = change.path[change.path.length - 1]
        emit('add-property', parentPath, String(key), change.newValue as JsonValue)
        break
      case 'delete':
        emit('remove-node', change.path)
        break
    }
  }
  
  // Clear pending changes and close modal
  pendingChanges.value = []
  showDiffModal.value = false
}

function cancelAdd() {
  showAddForm.value = false
  newKey.value = ''
  newType.value = 'string'
}

watch(selectedItem, (item) => {
  if (item && !hasChildren(item)) {
    editValue.value = String(item.value)
    editType.value = item.type as 'string' | 'number' | 'boolean' | 'null'
  }
})

onMounted(() => {
  // Capture original data for comparison
  originalData.value = currentJsonData.value
})
</script>

<style scoped>
.json-miller {
  display: flex;
  height: 70vh;
  background: var(--miller-bg);
  border-radius: 12px;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04);
}

.json-miller--light {
  --miller-bg: #ffffff;
  --miller-column-bg: #ffffff;
  --miller-border: #e5e7eb;
  --miller-border-subtle: #f3f4f6;
  --miller-text: #111827;
  --miller-text-muted: #6b7280;
  --miller-text-subtle: #9ca3af;
  --miller-hover: #f9fafb;
  --miller-selected: #3b82f6;
  --miller-selected-bg: #eff6ff;
  --miller-header-bg: #fafbfc;
  --miller-shadow: rgba(0, 0, 0, 0.05);
}

.json-miller--dark {
  --miller-bg: #111827;
  --miller-column-bg: #1f2937;
  --miller-border: #374151;
  --miller-border-subtle: #2d3748;
  --miller-text: #f9fafb;
  --miller-text-muted: #d1d5db;
  --miller-text-subtle: #9ca3af;
  --miller-hover: #252a34;
  --miller-selected: #3b82f6;
  --miller-selected-bg: #1e3a8a;
  --miller-header-bg: #1a202c;
  --miller-shadow: rgba(0, 0, 0, 0.2);
}

.miller-columns {
  display: flex;
  flex: 1;
  overflow-x: auto;
  gap: 1px;
  background: var(--miller-border-subtle);
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: var(--miller-border) transparent;
}

.miller-columns::-webkit-scrollbar {
  height: 8px;
}

.miller-columns::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.miller-columns::-webkit-scrollbar-thumb {
  background: var(--miller-border);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.miller-columns::-webkit-scrollbar-thumb:hover {
  background: var(--miller-text-muted);
}

.miller-column {
  min-width: 260px;
  background: var(--miller-column-bg);
  display: flex;
  flex-direction: column;
  position: relative;
}

.miller-column:first-child {
  border-top-left-radius: 11px;
  border-bottom-left-radius: 11px;
}

.column-header {
  padding: 16px 20px 12px;
  background: var(--miller-header-bg);
  border-bottom: 1px solid var(--miller-border-subtle);
  font-size: 12px;
  font-weight: 600;
  color: var(--miller-text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.column-content {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.column-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  color: var(--miller-text);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 0;
  margin: 0 8px;
  border-radius: 8px;
}

.column-item:hover {
  background: var(--miller-hover);
  transform: translateX(2px);
}

.column-item.selected {
  background: var(--miller-selected-bg);
  color: var(--miller-selected);
  font-weight: 500;
  box-shadow: 0 2px 4px var(--miller-shadow);
}

.column-item.has-children {
  font-weight: 500;
}

.column-item.has-children::after {
  content: '';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-right: 2px solid var(--miller-text-subtle);
  border-bottom: 2px solid var(--miller-text-subtle);
  transform: translateY(-50%) rotate(-45deg);
  transition: all 0.2s ease;
}

.column-item.selected.has-children::after {
  border-color: var(--miller-selected);
}

.item-icon {
  margin-right: 12px;
  font-size: 14px;
  opacity: 0.8;
}

.item-icon.type-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  opacity: 1;
}

.item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 450;
}

.item-arrow {
  display: none;
}

.value-inspector {
  width: 320px;
  background: var(--miller-column-bg);
  border-left: 1px solid var(--miller-border-subtle);
  display: flex;
  flex-direction: column;
  border-top-right-radius: 11px;
  border-bottom-right-radius: 11px;
}

.inspector-header {
  padding: 16px 20px 12px;
  background: var(--miller-header-bg);
  border-bottom: 1px solid var(--miller-border-subtle);
  font-size: 12px;
  font-weight: 600;
  color: var(--miller-text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.inspector-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* New compact header design */
.item-header {
  background: var(--miller-hover);
  border-radius: 8px;
  border: 1px solid var(--miller-border-subtle);
  padding: 12px;
}

.item-header-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.item-icon-compact {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.item-header-text {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--miller-text);
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.item-type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-badge--string { background: var(--json-type-string-bg, #dcfce7); color: var(--json-type-string-color, #166534); }
.type-badge--number { background: var(--json-type-number-bg, #dbeafe); color: var(--json-type-number-color, #1e40af); }
.type-badge--boolean { background: var(--json-type-boolean-bg, #f3e8ff); color: var(--json-type-boolean-color, #7c3aed); }
.type-badge--null { background: var(--json-type-null-bg, #f1f5f9); color: var(--json-type-null-color, #64748b); }
.type-badge--object { background: var(--json-type-object-bg, #fef3c7); color: var(--json-type-object-color, #92400e); }
.type-badge--array { background: var(--json-type-array-bg, #fee2e2); color: var(--json-type-array-color, #dc2626); }

.item-path-compact {
  font-size: 12px;
  color: var(--miller-text-subtle);
  font-family: var(--miller-font-mono);
}

.item-stats {
  display: flex;
  justify-content: flex-end;
}

.stat-badge {
  font-size: 11px;
  padding: 4px 8px;
  background: var(--miller-bg);
  border: 1px solid var(--miller-border-subtle);
  border-radius: 12px;
  color: var(--miller-text-subtle);
  font-weight: 500;
}

.item-icon-large {
  font-size: 24px;
  margin-right: 16px;
  opacity: 0.9;
}

.item-icon-large.type-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  opacity: 1;
}

.type-indicator--string {
  background: var(--json-type-string-bg, #dcfce7);
  color: var(--json-type-string-color, #166534);
}

.type-indicator--number {
  background: var(--json-type-number-bg, #dbeafe);
  color: var(--json-type-number-color, #1e40af);
}

.type-indicator--boolean {
  background: var(--json-type-boolean-bg, #f3e8ff);
  color: var(--json-type-boolean-color, #7c3aed);
}

.type-indicator--null {
  background: var(--json-type-null-bg, #f1f5f9);
  color: var(--json-type-null-color, #64748b);
}

.type-indicator--object {
  background: var(--json-type-object-bg, #fef3c7);
  color: var(--json-type-object-color, #92400e);
}

.type-indicator--array {
  background: var(--json-type-array-bg, #fee2e2);
  color: var(--json-type-array-color, #dc2626);
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--miller-text);
  margin-bottom: 6px;
  word-break: break-word;
}

.item-type {
  font-size: 11px;
  font-weight: 600;
  color: var(--miller-selected);
  background: var(--miller-selected-bg);
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.item-path {
  font-size: 12px;
  color: var(--miller-text-muted);
  font-family: 'SF Mono', Monaco, 'Consolas', monospace;
  background: var(--miller-column-bg);
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid var(--miller-border-subtle);
  word-break: break-all;
}

/* Section styling */
.value-section, .actions-section {
  background: var(--miller-bg);
  border: 1px solid var(--miller-border-subtle);
  border-radius: 8px;
  overflow: hidden;
}

.errors-section {
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

/* Compact value editor */
.value-editor-compact {
  padding: 12px;
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

.value-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--miller-border-subtle);
  border-radius: 4px;
  background: var(--miller-bg);
  color: var(--miller-text);
  font-size: 13px;
  font-family: var(--miller-font-mono);
}

.value-input-wide {
  width: 100%;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid var(--miller-border-subtle);
  border-radius: 6px;
  background: var(--miller-bg);
  color: var(--miller-text);
  font-size: 13px;
  font-family: var(--miller-font-mono);
  transition: all 0.2s ease;
}

.value-input:focus,
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

.null-indicator {
  flex: 1;
  padding: 6px 10px;
  background: var(--miller-hover);
  border: 1px solid var(--miller-border-subtle);
  border-radius: 4px;
  color: var(--miller-text-subtle);
  font-style: italic;
  font-size: 13px;
  text-align: center;
}

.editor-group {
  margin-bottom: 16px;
}

.editor-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--miller-text-muted);
  margin-bottom: 6px;
}

.editor-input,
.editor-select {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid var(--miller-border-subtle);
  border-radius: 8px;
  background: var(--miller-column-bg);
  color: var(--miller-text);
  font-size: 14px;
  transition: all 0.2s ease;
  font-family: 'SF Mono', Monaco, 'Consolas', monospace;
}

.editor-input:focus,
.editor-select:focus {
  outline: none;
  border-color: var(--miller-selected);
  box-shadow: 0 0 0 3px var(--miller-selected-bg);
}

.null-value {
  padding: 12px 14px;
  color: var(--miller-text-muted);
  font-style: italic;
  font-size: 14px;
  background: var(--miller-hover);
  border-radius: 8px;
  border: 2px solid var(--miller-border-subtle);
}

.container-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--miller-hover);
  border-radius: 10px;
  border: 2px solid var(--miller-border-subtle);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.info-label {
  color: var(--miller-text-muted);
  font-weight: 500;
}

.info-value {
  color: var(--miller-text);
  font-family: 'SF Mono', Monaco, 'Consolas', monospace;
  font-weight: 600;
  background: var(--miller-column-bg);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--miller-border-subtle);
}

/* New action styling */
.action-grid {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--miller-border-subtle);
  border-radius: 6px;
  background: var(--miller-column-bg);
  color: var(--miller-text);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-btn:hover {
  background: var(--miller-hover);
  border-color: var(--miller-accent);
}

.action-btn.add-btn {
  background: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
  font-weight: 600;
}

.action-btn.add-btn:hover {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.success {
  background: var(--json-type-string-bg, #dcfce7);
  color: var(--json-type-string-color, #166534);
  border-color: var(--json-type-string-color, #166534);
}

.btn-icon {
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-btn:hover {
  background: var(--miller-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--miller-shadow);
}

/* Simple Enhanced Save Button */
.action-btn.save-btn {
  background: #10b981;
  border: 1px solid #10b981;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.action-btn.save-btn:hover {
  background: #059669;
  border-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.save-icon {
  font-size: 14px;
}

.save-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
}

.action-btn.save-btn:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  color: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.action-btn.save-btn:disabled:hover {
  background: #9ca3af;
  border-color: #9ca3af;
  transform: none;
  box-shadow: none;
}

/* Dark theme support */
.json-miller--dark .action-btn.add-btn {
  background: #2563eb;
  border-color: #2563eb;
}

.json-miller--dark .action-btn.add-btn:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

.json-miller--dark .action-btn.save-btn {
  background: #059669;
  border-color: #059669;
}

.json-miller--dark .action-btn.save-btn:hover {
  background: #047857;
  border-color: #047857;
}

.json-miller--dark .action-btn.save-btn:disabled {
  background: #4b5563;
  border-color: #4b5563;
  color: #6b7280;
}

.json-miller--dark .action-btn.save-btn:disabled:hover {
  background: #4b5563;
  border-color: #4b5563;
}

.add-form {
  margin-top: 16px;
  padding: 20px;
  background: var(--miller-hover);
  border-radius: 12px;
  border: 2px solid var(--miller-border-subtle);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--miller-text-muted);
  margin-bottom: 6px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid var(--miller-border-subtle);
  border-radius: 8px;
  font-size: 13px;
  background: var(--miller-column-bg);
  color: var(--miller-text);
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--miller-selected);
  box-shadow: 0 0 0 3px var(--miller-selected-bg);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.form-btn {
  flex: 1;
  padding: 10px 16px;
  border: 2px solid var(--miller-border-subtle);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--miller-column-bg);
  color: var(--miller-text);
}

.form-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px var(--miller-shadow);
}

.form-btn.primary {
  background: var(--miller-selected);
  border-color: var(--miller-selected);
  color: white;
}

.form-btn.primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* Compact form styling */
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

.errors-content {
  padding: 12px;
}

.error-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #ef4444;
  background: #fef2f2;
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #fecaca;
  margin-bottom: 6px;
}

.error-item:last-child {
  margin-bottom: 0;
}

.error-icon {
  font-size: 14px;
  color: #dc2626;
  margin-bottom: 8px;
  padding: 12px;
  background: #fef2f2;
  border-radius: 8px;
  border: 2px solid #fecaca;
}

.json-miller--dark .error-item {
  background: #7f1d1d;
  border-color: #991b1b;
  color: #fca5a5;
}

.empty-inspector {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--miller-text-muted);
  padding: 40px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.4;
}

.empty-text {
  font-size: 15px;
  font-weight: 500;
}

/* Diff Modal */
.diff-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.diff-modal {
  background: var(--miller-column-bg);
  border-radius: 16px;
  max-width: 700px;
  width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--miller-border);
}

.diff-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--miller-border-subtle);
}

.diff-modal__header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--miller-text);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--miller-hover);
  border-radius: 8px;
  color: var(--miller-text-muted);
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--miller-border-subtle);
  color: var(--miller-text);
}

.diff-modal__content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.diff-summary {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--miller-hover);
  border-radius: 10px;
  border: 2px solid var(--miller-border-subtle);
}

.diff-count {
  font-weight: 600;
  color: var(--miller-text);
  font-size: 14px;
}

.diff-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.diff-item {
  padding: 16px;
  background: var(--miller-hover);
  border-radius: 12px;
  border: 2px solid var(--miller-border-subtle);
}

.diff-path {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.path-icon {
  font-size: 14px;
}

.diff-path code {
  background: var(--miller-column-bg);
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'SF Mono', Monaco, 'Consolas', monospace;
  font-size: 12px;
  color: var(--miller-text);
  border: 1px solid var(--miller-border-subtle);
}

.diff-change {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.diff-before,
.diff-after {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.diff-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--miller-text-muted);
}

.diff-value {
  padding: 8px 12px;
  border-radius: 8px;
  font-family: 'SF Mono', Monaco, 'Consolas', monospace;
  font-size: 13px;
  word-break: break-all;
}

.diff-value--old {
  background: #fef2f2;
  border: 2px solid #fecaca;
  color: #dc2626;
}

.diff-value--new {
  background: #f0fdf4;
  border: 2px solid #bbf7d0;
  color: #16a34a;
}

.json-miller--dark .diff-value--old {
  background: #7f1d1d;
  border-color: #991b1b;
  color: #fca5a5;
}

.json-miller--dark .diff-value--new {
  background: #14532d;
  border-color: #166534;
  color: #86efac;
}

.diff-arrow {
  font-size: 16px;
  color: var(--miller-text-muted);
  text-align: center;
}

.diff-type {
  display: flex;
  justify-content: flex-end;
}

.change-type {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.change-type--update {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.change-type--add {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.change-type--delete {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.json-miller--dark .change-type--update {
  background: #1e3a8a;
  color: #93c5fd;
  border-color: #3730a3;
}

.json-miller--dark .change-type--add {
  background: #14532d;
  color: #86efac;
  border-color: #166534;
}

.json-miller--dark .change-type--delete {
  background: #7f1d1d;
  color: #fca5a5;
  border-color: #991b1b;
}

.diff-modal__footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--miller-border-subtle);
  justify-content: flex-end;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.modal-btn--secondary {
  background: var(--miller-hover);
  color: var(--miller-text);
  border-color: var(--miller-border-subtle);
}

.modal-btn--secondary:hover {
  background: var(--miller-border-subtle);
}

.modal-btn--primary {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.modal-btn--primary:hover {
  background: #059669;
  border-color: #059669;
}
</style>