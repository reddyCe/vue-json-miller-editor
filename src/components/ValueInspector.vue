<template>
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
              <!-- Special Value Indicator in Header -->
              <span 
                v-if="!hasChildren(selectedItem) && selectedItem.type === 'string' && getSpecialValuePreview(selectedItem.value)" 
                class="special-value-indicator"
                :title="getSpecialValueTooltip(selectedItem.value) || undefined"
              >
                {{ getSpecialValuePreview(selectedItem.value) }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="hasChildren(selectedItem)" class="item-stats">
          <div class="stat-badge">
            {{ selectedItem.children?.length || 0 }} {{ selectedItem.type === 'array' ? 'items' : 'props' }}
          </div>
        </div>
      </div>

      <!-- Validation Issues -->
      <ValidationSection
        :errors="selectedItemErrors"
        :validation-warning="validationWarning"
        @continue-with-change="continueWithChange"
        @revert-change="revertChange"
      />

      <!-- Value Editor -->
      <ValueEditor
        :selected-item="selectedItem"
        :options="options"
        @update-value="handleUpdateValue"
        @validation-warning="handleValidationWarning"
      />

      <!-- Actions -->
      <ActionsSection
        :selected-item="selectedItem"
        :options="options"
        :has-unsaved-changes="hasUnsavedChanges"
        :pending-changes-count="pendingChanges.length"
        @add-item="handleAddItem"
        @show-diff-modal="$emit('show-diff-modal')"
      />

    </div>

    <div v-else class="empty-inspector">
      <div class="empty-icon">📄</div>
      <div class="empty-text">Select an item to view details</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { 
  JsonNode as JsonNodeType, 
  ValidationError,
  JsonEditorOptions, 
  JsonValue, 
  JsonPath 
} from '../types'
import { useSpecialValueDetection } from '../composables/useSpecialValueDetection'
import ValidationSection from './ValidationSection.vue'
import ValueEditor from './ValueEditor.vue'
import ActionsSection from './ActionsSection.vue'

interface PendingChange {
  type: string
  path: JsonPath
  oldValue?: JsonValue
  newValue?: JsonValue
}

interface Props {
  selectedItem: JsonNodeType | null
  validationErrors: ValidationError[]
  options: JsonEditorOptions
  validationWarning?: string | null
  hasUnsavedChanges: boolean
  pendingChanges: PendingChange[]
}

interface Emits {
  (e: 'update-value', value: JsonValue, type: string): void
  (e: 'add-item', key: string | number, value: JsonValue): void
  (e: 'show-diff-modal'): void
  (e: 'continue-with-change'): void
  (e: 'revert-change'): void
  (e: 'validation-warning', warning: string | null): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Initialize special value detection composable
const { 
  getSpecialValuePreview, 
  getSpecialValueTooltip,
} = useSpecialValueDetection(props.options)

const selectedItemErrors = computed(() => {
  if (!props.selectedItem) return []
  return props.validationErrors.filter(error =>
    JSON.stringify(error.path) === JSON.stringify(props.selectedItem!.path)
  )
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

function getCompactPath(): string {
  if (!props.selectedItem) return ''
  const path = props.selectedItem.path
  if (path.length === 0) return 'root'
  if (path.length <= 3) return path.join(' › ')
  return `...${path.slice(-2).join(' › ')}`
}

function handleUpdateValue(value: JsonValue, type: string) {
  emit('update-value', value, type)
}

function handleAddItem(key: string | number, value: JsonValue) {
  emit('add-item', key, value)
}

function continueWithChange() {
  emit('continue-with-change')
}

function revertChange() {
  emit('revert-change')
}

function handleValidationWarning(warning: string | null) {
  emit('validation-warning', warning)
}
</script>

<style scoped>
.value-inspector {
  width: 380px;
  min-width: 380px;
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
  overflow-x: hidden;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

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
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
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
  word-break: break-all;
  overflow-wrap: break-word;
  min-width: 0;
}

.special-value-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--miller-selected-bg);
  color: var(--miller-selected);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid var(--miller-border-subtle);
  cursor: help;
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

/* Responsive adjustments */
@media (max-width: 1024px) {
  .value-inspector {
    width: 350px;
    min-width: 350px;
  }
}

@media (max-width: 768px) {
  .value-inspector {
    width: 320px;
    min-width: 320px;
  }
  
  .inspector-content {
    padding: 12px;
    gap: 10px;
  }
  
  .item-header {
    padding: 10px;
  }
}
</style>