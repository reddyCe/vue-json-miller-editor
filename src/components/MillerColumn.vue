<template>
  <div class="miller-column">
    <div class="column-header">
      {{ title }}
    </div>
    <div class="column-content">
      <div
        v-for="item in items"
        :key="item.id"
        class="column-item"
        :class="{ 
          selected: isSelected(item),
          'has-children': hasChildren(item)
        }"
        @click="selectItem(item)"
      >
        <span class="item-icon type-indicator" :class="`type-indicator--${item.type}`">
          {{ getItemIcon(item) }}
        </span>
        <span class="item-name">{{ getItemName(item) }}</span>
        <span v-if="getItemErrors(item).length > 0" class="error-indicator" :title="`${getItemErrors(item).length} validation error(s)`">⚠</span>
        <span v-if="hasChildren(item)" class="item-arrow">▶</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JsonNode as JsonNodeType, ValidationError } from '../types'

interface Props {
  items: JsonNodeType[]
  title: string
  selectedItemId?: string
  validationErrors: ValidationError[]
}

interface Emits {
  (e: 'select-item', item: JsonNodeType): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function hasChildren(item: JsonNodeType): boolean {
  return item.type === 'object' || item.type === 'array'
}

function getItemErrors(item: JsonNodeType): ValidationError[] {
  return props.validationErrors.filter(error =>
    JSON.stringify(error.path) === JSON.stringify(item.path)
  )
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

function isSelected(item: JsonNodeType): boolean {
  return props.selectedItemId === item.id
}

function selectItem(item: JsonNodeType) {
  emit('select-item', item)
}
</script>

<style scoped>
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

.error-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 600;
  border: 1px solid #fecaca;
  cursor: help;
  margin-left: auto;
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
</style>