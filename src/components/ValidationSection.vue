<template>
  <div v-if="errors.length > 0 || validationWarning" class="validation-issues">
    <!-- Validation Errors -->
    <div v-if="errors.length > 0" class="validation-errors-compact">
      <div class="error-summary" @click="toggleErrorsExpanded">
        <span class="error-icon">⚠</span>
        <span class="error-count">{{ errors.length }} validation error{{ errors.length !== 1 ? 's' : '' }}</span>
        <span class="expand-icon" :class="{ expanded: errorsExpanded }">▶</span>
      </div>
      <div v-if="errorsExpanded" class="error-list">
        <div v-for="error in errors" :key="error.message" class="error-item-compact">
          <span class="error-keyword">{{ error.keyword }}</span>
          <span class="error-message">{{ error.message }}</span>
        </div>
      </div>
    </div>

    <!-- Validation Warning (Priority - always expanded) -->
    <div v-if="validationWarning" class="validation-warning-section">
      <div class="section-header">
        <span class="section-title">⚠️ Input Warning</span>
      </div>
      <div class="warning-content">
        <div class="warning-message">
          {{ validationWarning }}
        </div>
        <div class="warning-actions">
          <button class="warning-btn warning-btn--continue" @click="continueWithChange">
            Continue
          </button>
          <button class="warning-btn warning-btn--revert" @click="revertChange">
            Revert
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ValidationError } from '../types'

interface Props {
  errors: ValidationError[]
  validationWarning?: string | null
}

interface Emits {
  (e: 'continue-with-change'): void
  (e: 'revert-change'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const errorsExpanded = ref(false)

function toggleErrorsExpanded() {
  errorsExpanded.value = !errorsExpanded.value
}

function continueWithChange() {
  emit('continue-with-change')
}

function revertChange() {
  emit('revert-change')
}

// Auto-expand errors if there are only 1-2 errors (less crowded)
// Keep collapsed if there are many errors (3+)
watch(() => props.errors, (newErrors) => {
  errorsExpanded.value = newErrors.length > 0 && newErrors.length <= 2
}, { immediate: true })
</script>

<style scoped>
.validation-issues {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.validation-errors-compact, .validation-warning-section {
  background: var(--miller-bg);
  border: 1px solid var(--miller-border-subtle);
  border-radius: 8px;
  overflow: hidden;
}

.validation-errors-compact {
  border-color: #f87171;
  background: #fef2f2;
}

.error-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #f87171;
  color: white;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.error-summary:hover {
  background: #dc2626;
}

.expand-icon {
  margin-left: auto;
  font-size: 10px;
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.error-summary .error-icon {
  font-size: 12px;
}

.error-list {
  padding: 6px;
  max-height: 80px;
  overflow-y: auto;
}

.error-item-compact {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 3px 0;
  font-size: 10px;
  line-height: 1.3;
}

.error-item-compact:not(:last-child) {
  border-bottom: 1px solid #fecaca;
  padding-bottom: 6px;
  margin-bottom: 3px;
}

.error-keyword {
  background: #dc2626;
  color: white;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.error-message {
  color: #dc2626;
  font-weight: 500;
  flex: 1;
  word-wrap: break-word;
}

.validation-warning-section {
  border-color: #f59e0b;
  background: #fffbeb;
}

.validation-warning-section .section-header {
  background: #f59e0b;
  color: white;
}

/* More compact when shown with errors */
.validation-issues .validation-warning-section .section-header {
  padding: 4px 8px;
  font-size: 10px;
}

.validation-issues .warning-content {
  padding: 6px;
}

.validation-issues .warning-message {
  font-size: 10px;
  margin-bottom: 6px;
}

.validation-issues .warning-btn {
  padding: 4px 8px;
  font-size: 10px;
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

.warning-content {
  padding: 8px;
}

.warning-message {
  color: #92400e;
  font-size: 11px;
  line-height: 1.3;
  margin-bottom: 8px;
  font-weight: 500;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

.warning-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.warning-btn {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  flex: 1;
  min-width: 0;
  text-align: center;
}

.warning-btn--continue {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.warning-btn--continue:hover {
  background: #d97706;
  border-color: #d97706;
}

.warning-btn--revert {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.warning-btn--revert:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

/* Dark theme support for warnings and errors */
.json-miller--dark .validation-warning-section {
  background: #451a03;
  border-color: #f59e0b;
}

.json-miller--dark .validation-warning-section .section-header {
  background: #f59e0b;
}

.json-miller--dark .warning-message {
  color: #fbbf24;
}

.json-miller--dark .warning-btn--revert {
  background: #374151;
  color: #f3f4f6;
  border-color: #6b7280;
}

.json-miller--dark .warning-btn--revert:hover {
  background: #4b5563;
}

.json-miller--dark .validation-errors-compact {
  background: #7f1d1d;
  border-color: #f87171;
}

.json-miller--dark .error-summary {
  background: #dc2626;
}

.json-miller--dark .error-message {
  color: #fca5a5;
}

.json-miller--dark .error-item-compact:not(:last-child) {
  border-bottom-color: #991b1b;
}

.json-miller--dark .error-indicator {
  background: #7f1d1d;
  border-color: #991b1b;
  color: #fca5a5;
}
</style>