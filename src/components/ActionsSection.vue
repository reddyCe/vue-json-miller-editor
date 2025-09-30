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
      :parent-type="parentType"
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

const parentType = computed((): 'object' | 'array' => {
  return (props.selectedItem?.type as 'object' | 'array') || 'object'
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
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 32px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.025em;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: 44px;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.action-btn:active {
  transform: translateY(0) scale(0.98);
  transition: all 0.1s ease;
}

.action-btn.add-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.action-btn.add-btn:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.btn-icon {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.action-btn.save-btn {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(17, 153, 142, 0.2);
}

.action-btn.save-btn:hover {
  background: linear-gradient(135deg, #0d7377 0%, #2dd4bf 100%);
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.25);
}

.save-badge {
  background: rgba(255, 255, 255, 0.25);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn.save-btn:disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #d1d5db 100%);
  color: #6b7280;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 1px 4px rgba(156, 163, 175, 0.15);
  opacity: 0.6;
}

.action-btn.save-btn:disabled:hover {
  background: linear-gradient(135deg, #9ca3af 0%, #d1d5db 100%);
  transform: none;
  box-shadow: 0 1px 4px rgba(156, 163, 175, 0.15);
}

/* Dark theme support */
.json-miller--dark .action-btn.add-btn {
  background: linear-gradient(135deg, #4c51bf 0%, #553c9a 100%);
  box-shadow: 0 2px 8px rgba(76, 81, 191, 0.2);
}

.json-miller--dark .action-btn.add-btn:hover {
  background: linear-gradient(135deg, #434190 0%, #4c1d95 100%);
  box-shadow: 0 4px 12px rgba(76, 81, 191, 0.25);
}

.json-miller--dark .action-btn.save-btn {
  background: linear-gradient(135deg, #047857 0%, #10b981 100%);
  box-shadow: 0 2px 8px rgba(4, 120, 87, 0.2);
}

.json-miller--dark .action-btn.save-btn:hover {
  background: linear-gradient(135deg, #065f46 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);
}

.json-miller--dark .action-btn.save-btn:disabled {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  color: #6b7280;
  box-shadow: 0 1px 4px rgba(55, 65, 81, 0.15);
  opacity: 0.6;
}

.json-miller--dark .action-btn.save-btn:disabled:hover {
  background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
  box-shadow: 0 1px 4px rgba(55, 65, 81, 0.15);
}
</style>
