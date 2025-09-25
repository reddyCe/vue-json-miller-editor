<template>
  <div v-if="shouldShowSection" class="actions-section">
    <div class="section-header">
      <span class="section-title">Actions</span>
    </div>
    
    <div class="action-grid">
      <button 
        v-if="showAddButton"
        class="action-btn add-btn"
        @click="showAddForm = true"
      >
        <span class="btn-icon">+</span>
        {{ selectedItem?.type === 'array' ? (options.locale?.addItem || 'Add Item') : (options.locale?.addProperty || 'Add Property') }}
      </button>
      <button 
        v-if="showSaveButton"
        class="action-btn save-btn"
        :disabled="!hasUnsavedChanges"
        @click="$emit('show-diff-modal')"
      >
        <span class="btn-icon">💾</span>
        {{ options.locale?.saveChanges || 'Save Changes' }}
        <span v-if="pendingChangesCount > 0" class="save-badge">{{ pendingChangesCount }}</span>
      </button>
    </div>

    <AddForm
      :show="showAddForm"
      :parent-type="selectedItem?.type as 'object' | 'array'"
      :parent-children-length="selectedItem?.children?.length || 0"
      @add-item="addItem"
      @cancel="showAddForm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { JsonNode as JsonNodeType, JsonEditorOptions, JsonValue } from '../types'
import AddForm from './AddForm.vue'

interface Props {
  selectedItem: JsonNodeType | null
  options: JsonEditorOptions
  hasUnsavedChanges: boolean
  pendingChangesCount: number
}

interface Emits {
  (e: 'add-item', key: string | number, value: JsonValue): void
  (e: 'show-diff-modal'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showAddForm = ref(false)

const hasChildren = computed(() => {
  if (!props.selectedItem) return false
  return props.selectedItem.type === 'object' || props.selectedItem.type === 'array'
})

const showAddButton = computed(() => {
  return props.options.showAddButton && 
         props.selectedItem && 
         hasChildren.value
})

const showSaveButton = computed(() => {
  return props.options.showSaveButton
})

const shouldShowSection = computed(() => {
  if (!props.options.editable) return false
  return showSaveButton.value || showAddButton.value
})

function addItem(key: string | number, value: JsonValue) {
  emit('add-item', key, value)
  showAddForm.value = false
}
</script>

<style scoped>
.actions-section {
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

.action-grid {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--miller-shadow);
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

.btn-icon {
  font-size: 14px;
  font-weight: 600;
}

.action-btn.save-btn {
  background: #10b981;
  border: 1px solid #10b981;
  color: white;
  font-weight: 600;
}

.action-btn.save-btn:hover {
  background: #059669;
  border-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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
</style>