<template>
  <div 
    class="json-editor" 
    :class="themeClass" 
    :style="rootStyle"
    role="application"
    aria-label="JSON Editor"
    :aria-busy="isLoading"
  >
    
    <div class="json-editor__content">
      <div v-if="isLoading" class="json-editor__loading" role="status" aria-live="polite">
        {{ mergedOptions.locale.loading }}
      </div>
      
      <div v-else-if="lastError" class="json-editor__error" role="alert" aria-live="assertive">
        <span class="icon" aria-hidden="true">⚠</span>
        Error: {{ lastError.message }}
      </div>
      
      <JsonMillerView 
        v-else
        :node="rootNode"
        :validation-errors="validationErrors"
        :options="mergedOptions"
        @update-value="handleIndividualChange"
        @add-property="handleIndividualChange"
        @remove-node="handleIndividualChange"
        @save="handleSave"
        @change="handleMillerChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, type CSSProperties } from 'vue'
import type { 
  JsonValue, 
  JsonNode as JsonNodeType, 
  JsonPath, 
  JsonEditorOptions, 
  ValidationError 
} from '../types'
import { 
  parseJsonToTree
} from '../utils/json-model'
import { validateJson as validate } from '../utils/json-validator'
import { validateInput, type InputValidationOptions } from '../utils/input-validation'
import { mergeOptions, generateCssVariables } from '../utils/config'
import JsonMillerView from './JsonMillerView.vue'

interface Props {
  modelValue: JsonValue
  schema?: object
  options?: Partial<JsonEditorOptions>
}

interface Emits {
  (e: 'update:modelValue', value: JsonValue): void
  (e: 'change', value: JsonValue): void
  (e: 'validate', errors: ValidationError[]): void
  (e: 'error', error: Error): void
  (e: 'ready'): void
  (e: 'save', changes: PendingChange[], finalValue: JsonValue): void
}

const props = withDefaults(defineProps<Props>(), {
  options: () => ({})
})

const emit = defineEmits<Emits>()

// Error handling
const lastError = ref<Error | null>(null)
const isLoading = ref(false)

// Basic JSON serialization check
function isValidJsonValue(value: unknown): value is JsonValue {
  try {
    // Check if value can be serialized to JSON
    JSON.stringify(value)
    return true
  } catch {
    return false
  }
}

// Comprehensive input validation and sanitization
function validateAndSanitizeInput(value: JsonValue): JsonValue {
  if (!mergedOptions.value.inputValidation?.enabled) {
    return value
  }
  
  const validationOptions: InputValidationOptions = {
    maxStringLength: mergedOptions.value.inputValidation?.maxStringLength ?? 10000,
    maxNumberValue: mergedOptions.value.inputValidation?.maxNumberValue ?? Number.MAX_SAFE_INTEGER,
    minNumberValue: mergedOptions.value.inputValidation?.minNumberValue ?? Number.MIN_SAFE_INTEGER,
    maxObjectDepth: mergedOptions.value.inputValidation?.maxObjectDepth ?? 50,
    maxArrayLength: mergedOptions.value.inputValidation?.maxArrayLength ?? 10000,
    maxObjectKeys: mergedOptions.value.inputValidation?.maxObjectKeys ?? 1000,
    sanitizeHtml: mergedOptions.value.inputValidation?.sanitizeHtml ?? true,
    allowCircularReferences: mergedOptions.value.inputValidation?.allowCircularReferences ?? false
  }
  
  const result = validateInput(value, validationOptions)
  
  if (!result.isValid) {
    const errorMessage = `Input validation failed: ${result.errors.join(', ')}`
    handleError(new Error(errorMessage), 'input validation')
  }
  
  return result.sanitizedValue ?? value
}

function handleError(error: Error, context: string) {
  lastError.value = error
  console.error(`JsonEditor ${context}:`, error)
  emit('error', error)
}

function clearError() {
  lastError.value = null
}

const rootNode = ref<JsonNodeType | null>(null)
const validationErrors = ref<ValidationError[]>([])

const mergedOptions = computed(() => mergeOptions(props.options))

const themeClass = computed(() => {
  const classes = [`json-editor--${mergedOptions.value.theme}`]
  if (mergedOptions.value.className) {
    classes.push(mergedOptions.value.className)
  }
  return classes.join(' ')
})

const cssVariables = computed(() => generateCssVariables(mergedOptions.value))

const rootStyle = computed((): CSSProperties => {
  return cssVariables.value as CSSProperties
})



function initializeTree() {
  if (!isValidJsonValue(props.modelValue)) {
    handleError(new Error('Invalid JSON input provided'), 'initialization')
    return
  }
  
  try {
    isLoading.value = true
    clearError()
    
    // Validate and sanitize input if enabled
    const sanitizedValue = validateAndSanitizeInput(props.modelValue)
    
    rootNode.value = parseJsonToTree(sanitizedValue)
  } catch (error) {
    handleError(error as Error, 'tree initialization')
  } finally {
    isLoading.value = false
  }
}


interface PendingChange {
  type: string
  path: JsonPath
  oldValue?: JsonValue
  newValue?: JsonValue
}

function handleSave(changes: PendingChange[], finalValue: JsonValue) {
  emit('save', changes, finalValue)
}

function handleIndividualChange(_path: JsonPath, _value?: JsonValue) {
  // Don't update the actual model or emit model updates for individual changes
  // Just emit the change event to notify that an edit was made
  emit('change', props.modelValue)
}

function handleMillerChange() {
  // Emit change event when any value is edited in Miller view (not saved)
  emit('change', props.modelValue)
}

function validateJson() {
  if (!props.schema) {
    validationErrors.value = []
    emit('validate', [])
    return
  }
  
  try {
    const errors = validate(props.modelValue, props.schema)
    validationErrors.value = errors
    emit('validate', errors)
  } catch (error) {
    emit('error', error as Error)
  }
}

watch(() => props.modelValue, initializeTree, { deep: true })

watch(() => props.schema, () => {
  if (mergedOptions.value.validationMode === 'onChange') {
    validateJson()
  }
})


// Cleanup tracking
let cleanupFunctions: (() => void)[] = []

// Cleanup function registry (currently unused but kept for future use)
// function addCleanup(fn: () => void) {
//   cleanupFunctions.push(fn)
// }

function performCleanup() {
  cleanupFunctions.forEach(fn => {
    try {
      fn()
    } catch (error) {
      console.warn('Cleanup function failed:', error)
    }
  })
  cleanupFunctions = []
}


onMounted(async () => {
  await nextTick()
  
  initializeTree()
  
  if (mergedOptions.value.validationMode === 'onChange') {
    validateJson()
  }
  
  // Emit ready event when component is fully initialized
  emit('ready')
})

onUnmounted(() => {
  performCleanup()
  // Clear references to prevent memory leaks
  rootNode.value = null
  validationErrors.value = []
  lastError.value = null
})
</script>

<style scoped>
.json-editor {
  border: 1px solid var(--json-editor-border-color, #e2e8f0);
  border-radius: var(--json-editor-border-radius, 8px);
  background: var(--json-editor-bg, #ffffff);
  font-family: var(--json-editor-font-family, 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace);
  font-size: var(--json-editor-font-size, 13px);
  line-height: var(--json-editor-line-height, 1.6);
  box-shadow: none;
  overflow: hidden;
}

.json-editor--light {
  /* Background colors */
  --json-editor-bg: var(--json-editor-bg-override, #ffffff);
  --json-editor-header-bg: var(--json-editor-header-bg-override, #f8fafc);
  --json-editor-button-bg: var(--json-editor-button-bg-override, #f7fafc);
  --json-editor-button-hover-bg: var(--json-editor-button-hover-bg-override, #edf2f7);
  --json-editor-button-active-bg: var(--json-editor-button-active-bg-override, #4299e1);
  
  /* Text colors */
  --json-editor-text-color: var(--json-editor-text-color-override, #1a202c);
  --json-editor-text-muted: var(--json-editor-text-muted-override, #718096);
  --json-editor-button-active-text: var(--json-editor-button-active-text-override, #ffffff);
  
  /* Border colors */
  --json-editor-border-color: var(--json-editor-border-color-override, #e2e8f0);
  
  /* Status colors */
  --json-editor-status-valid-bg: var(--json-editor-status-valid-bg-override, #f0fff4);
  --json-editor-status-valid-border: var(--json-editor-status-valid-border-override, #9ae6b4);
  --json-editor-status-valid-text: var(--json-editor-status-valid-text-override, #22543d);
  --json-editor-status-error-bg: var(--json-editor-status-error-bg-override, #fed7d7);
  --json-editor-status-error-border: var(--json-editor-status-error-border-override, #feb2b2);
  --json-editor-status-error-text: var(--json-editor-status-error-text-override, #c53030);
  
  /* Type indicator colors */
  --json-type-string-bg: var(--json-type-string-bg-override, #dcfce7);
  --json-type-string-color: var(--json-type-string-color-override, #166534);
  --json-type-number-bg: var(--json-type-number-bg-override, #dbeafe);
  --json-type-number-color: var(--json-type-number-color-override, #1e40af);
  --json-type-boolean-bg: var(--json-type-boolean-bg-override, #f3e8ff);
  --json-type-boolean-color: var(--json-type-boolean-color-override, #7c3aed);
  --json-type-null-bg: var(--json-type-null-bg-override, #f1f5f9);
  --json-type-null-color: var(--json-type-null-color-override, #64748b);
  --json-type-object-bg: var(--json-type-object-bg-override, #fef3c7);
  --json-type-object-color: var(--json-type-object-color-override, #92400e);
  --json-type-array-bg: var(--json-type-array-bg-override, #fee2e2);
  --json-type-array-color: var(--json-type-array-color-override, #dc2626);
}

.json-editor--dark {
  /* Background colors */
  --json-editor-bg: var(--json-editor-bg-override, #1a202c);
  --json-editor-header-bg: var(--json-editor-header-bg-override, #2d3748);
  --json-editor-button-bg: var(--json-editor-button-bg-override, #2d3748);
  --json-editor-button-hover-bg: var(--json-editor-button-hover-bg-override, #4a5568);
  --json-editor-button-active-bg: var(--json-editor-button-active-bg-override, #63b3ed);
  
  /* Text colors */
  --json-editor-text-color: var(--json-editor-text-color-override, #f7fafc);
  --json-editor-text-muted: var(--json-editor-text-muted-override, #a0aec0);
  --json-editor-button-active-text: var(--json-editor-button-active-text-override, #1a202c);
  
  /* Border colors */
  --json-editor-border-color: var(--json-editor-border-color-override, #2d3748);
  
  /* Status colors */
  --json-editor-status-valid-bg: var(--json-editor-status-valid-bg-override, #22543d);
  --json-editor-status-valid-border: var(--json-editor-status-valid-border-override, #38a169);
  --json-editor-status-valid-text: var(--json-editor-status-valid-text-override, #9ae6b4);
  --json-editor-status-error-bg: var(--json-editor-status-error-bg-override, #742a2a);
  --json-editor-status-error-border: var(--json-editor-status-error-border-override, #e53e3e);
  --json-editor-status-error-text: var(--json-editor-status-error-text-override, #feb2b2);
  
  /* Type indicator colors - darker theme variants */
  --json-type-string-bg: var(--json-type-string-bg-override, #064e3b);
  --json-type-string-color: var(--json-type-string-color-override, #6ee7b7);
  --json-type-number-bg: var(--json-type-number-bg-override, #1e3a8a);
  --json-type-number-color: var(--json-type-number-color-override, #93c5fd);
  --json-type-boolean-bg: var(--json-type-boolean-bg-override, #581c87);
  --json-type-boolean-color: var(--json-type-boolean-color-override, #c4b5fd);
  --json-type-null-bg: var(--json-type-null-bg-override, #374151);
  --json-type-null-color: var(--json-type-null-color-override, #d1d5db);
  --json-type-object-bg: var(--json-type-object-bg-override, #78350f);
  --json-type-object-color: var(--json-type-object-color-override, #fcd34d);
  --json-type-array-bg: var(--json-type-array-bg-override, #7f1d1d);
  --json-type-array-color: var(--json-type-array-color-override, #fca5a5);
}


.json-editor__content {
  padding: 0;
  min-height: 300px;
  max-height: 70vh;
  overflow: auto;
  background: var(--json-editor-bg);
  position: relative;
}

.json-editor__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--json-editor-text-muted);
  font-size: 14px;
}

.json-editor__error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: var(--json-editor-status-error-bg);
  border: 1px solid var(--json-editor-status-error-border);
  color: var(--json-editor-status-error-text);
  border-radius: 6px;
  margin: 16px 20px;
  font-size: 14px;
}

.json-editor__error .icon {
  font-size: 16px;
}


/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>