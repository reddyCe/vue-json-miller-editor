<template>
  <div class="json-miller" :class="themeClass">
    <!-- Miller Columns -->
    <div class="miller-columns">
      <MillerColumn
        v-for="(column, index) in columns"
        :key="index"
        :items="column.items"
        :title="getColumnTitle(column, index)"
        :selected-item-id="column.selectedIndex !== undefined ? column.items[column.selectedIndex]?.id : undefined"
        :validation-errors="validationErrors"
        @select-item="(item) => selectItem(item, index)"
      />
    </div>

    <!-- Value Inspector -->
    <ValueInspector
      :selected-item="selectedItem"
      :validation-errors="validationErrors"
      :options="options"
      :validation-warning="validationWarning"
      :has-unsaved-changes="hasUnsavedChanges()"
      :pending-changes="pendingChanges"
      @update-value="handleUpdateValue"
      @add-item="handleAddItem"
      @show-diff-modal="showDiffModal = true"
      @continue-with-change="continueWithChange"
      @revert-change="revertChange"
      @validation-warning="(warning) => validationWarning = warning"
    />

    <!-- Diff Modal -->
    <DiffModal
      :show="showDiffModal"
      :changes="pendingChanges"
      :options="options"
      @close="showDiffModal = false"
      @save-changes="saveAllChanges"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'JsonMillerView'
})
import { ref, computed, watch, onMounted } from 'vue'
import type { 
  JsonNode as JsonNodeType, 
  ValidationError,
  JsonEditorOptions, 
  JsonValue, 
  JsonPath 
} from '../types'
import { treeToJson } from '../utils/json-model'
import { useSpecialValueDetection } from '../composables/useSpecialValueDetection'
import { useMillerNavigation } from '../composables/useMillerNavigation'
import { useChangeTracking, type PendingChange } from '../composables/useChangeTracking'
import { setValueAtPath, deleteValueAtPath } from '../utils/jsonPath'
import MillerColumn from './MillerColumn.vue'
import ValueInspector from './ValueInspector.vue'
import DiffModal from './DiffModal.vue'

interface Props {
  node: JsonNodeType | null
  validationErrors: ValidationError[]
  options: Required<JsonEditorOptions>
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

// Composables
const { scrollToColumnAfterSelection } = useMillerNavigation()
const { pendingChanges, trackChange, clearChanges, hasUnsavedChanges } = useChangeTracking()
const { 
  getTypeChangeWarning,
  wouldBreakSpecialType 
} = useSpecialValueDetection(props.options)

// Reactive state
const selectedPath = ref<JsonNodeType[]>([])
const showDiffModal = ref(false)
const originalData = ref<JsonValue | null>(null)

// Validation state
const validationWarning = ref<string | null>(null)
const originalValue = ref<JsonValue | null>(null)

// Computed properties
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

const currentJsonData = computed(() => {
  return props.node ? treeToJson(props.node) : null
})

// Helper functions
function hasChildren(item: JsonNodeType): boolean {
  return item.type === 'object' || item.type === 'array'
}

function getColumnTitle(column: { items: JsonNodeType[], selectedIndex?: number }, index: number): string {
  if (index === 0) return (props.options.locale?.root ?? 'Root')
  if (selectedPath.value[index - 1]) {
    return String(selectedPath.value[index - 1].key)
  }
  return (props.options.locale?.items ?? 'Items')
}

// Event handlers
function selectItem(item: JsonNodeType, columnIndex: number) {
  // Truncate selection path at this column and add the new selection
  selectedPath.value = selectedPath.value.slice(0, columnIndex)
  selectedPath.value.push(item as JsonNodeType)

  // Auto-scroll to show new column if item has children
  if (hasChildren(item)) {
    scrollToColumnAfterSelection(columnIndex)
  }
}

function handleUpdateValue(value: JsonValue, _type: string) {
  if (!selectedItem.value || hasChildren(selectedItem.value)) return

  // Check if this change would break special type consistency
  const originalVal = originalValue.value || selectedItem.value.value
  if (typeof value === 'string' && wouldBreakSpecialType(originalVal, value)) {
    const warning = getTypeChangeWarning(originalVal, value)
    if (warning) {
      validationWarning.value = warning
      originalValue.value = originalVal
      return // Don't apply the change yet, wait for user confirmation
    }
  }

  // Clear any existing warning
  validationWarning.value = null
  originalValue.value = null
  
  // Track the change
  trackChange(selectedItem.value.path, selectedItem.value.value, value, 'update')
  
  // Emit change event
  emit('change')
}

function handleAddItem(key: string | number, value: JsonValue) {
  if (!selectedItem.value) return

  // Track the addition
  const newPath = [...selectedItem.value.path, key]
  trackChange(newPath, undefined, value, 'add')
  
  // Emit change event
  emit('change')
}

function continueWithChange() {
  if (!selectedItem.value) return
  
  // Get the current pending value from the warning state
  const currentValue = originalValue.value || selectedItem.value.value
  
  // Force the change despite the warning
  trackChange(selectedItem.value.path, selectedItem.value.value, currentValue, 'update')
  validationWarning.value = null
  originalValue.value = null
  
  // Emit change event
  emit('change')
}

function revertChange() {
  validationWarning.value = null
  originalValue.value = null
}

function saveAllChanges() {
  if (pendingChanges.value.length === 0) return
  
  // Get current JSON value and apply changes to calculate final value
  const finalJson = JSON.parse(JSON.stringify(treeToJson(props.node!)))
  
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
  clearChanges()
  showDiffModal.value = false
}

// Watchers
watch(selectedItem, (item) => {
  if (item && !hasChildren(item)) {
    // Capture the original value for validation
    originalValue.value = item.value
    // Clear any existing warning when switching items
    validationWarning.value = null
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
  --miller-accent: #3b82f6;
  --miller-accent-bg: rgba(59, 130, 246, 0.1);
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
  --miller-accent: #3b82f6;
  --miller-accent-bg: rgba(59, 130, 246, 0.1);
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
</style>