<template>
  <div v-if="show" class="diff-modal-overlay" @click="close">
    <div class="diff-modal" @click.stop>
      <div class="diff-modal__header">
        <h3>Review Changes</h3>
        <button class="close-btn" @click="close">×</button>
      </div>
      
      <div class="diff-modal__content">
        <div class="diff-summary">
          <span class="diff-count">{{ changes.length }} change(s) pending</span>
        </div>
        
        <div class="diff-list">
          <div v-for="(change, index) in changes" :key="index" class="diff-item">
            <div class="diff-path">
              <span class="path-icon">📍</span>
              <code>{{ change.path.length === 0 ? 'root' : change.path.join('.') }}</code>
            </div>
            
            <div class="diff-change">
              <div class="diff-before">
                <span class="diff-label">Before:</span>
                <code class="diff-value diff-value--old">{{ formatValue(change.oldValue) }}</code>
              </div>
              <div class="diff-arrow">→</div>
              <div class="diff-after">
                <span class="diff-label">After:</span>
                <code class="diff-value diff-value--new">{{ formatValue(change.newValue) }}</code>
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
        <button class="modal-btn modal-btn--secondary" @click="close">
          {{ options.locale?.cancel || 'Cancel' }}
        </button>
        <button class="modal-btn modal-btn--primary" @click="saveChanges">
          ✓ {{ options.locale?.saveChanges || 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JsonValue, JsonPath, JsonEditorOptions } from '../types'

interface PendingChange {
  type: string
  path: JsonPath
  oldValue?: JsonValue
  newValue?: JsonValue
}

interface Props {
  show: boolean
  changes: PendingChange[]
  options: JsonEditorOptions
}

interface Emits {
  (e: 'close'): void
  (e: 'save-changes'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function close() {
  emit('close')
}

function saveChanges() {
  emit('save-changes')
}

function formatValue(value: JsonValue | undefined): string {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'object') {
    return Array.isArray(value) ? `[${value.length} items]` : `{${Object.keys(value).length} props}`
  }
  return String(value)
}
</script>

<style scoped>
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