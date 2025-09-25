# JsonEditor Configuration Guide

The Vue JSON Editor provides extensive configuration options to customize its appearance and behavior.

## Basic Usage

```vue
<template>
  <JsonEditor
    v-model="jsonData"
    :schema="jsonSchema"
    :options="editorOptions"
    @change="handleChange"
    @validate="handleValidate"
    @error="handleError"
  />
</template>

<script setup>
import { ref } from 'vue'
import { JsonEditor } from 'vue-json-edtr'
import 'vue-json-edtr/dist/vue-json-edtr.css'

const jsonData = ref({ example: 'data' })
const jsonSchema = ref({ type: 'object' })

const editorOptions = ref({
  theme: 'light',
  editable: true,
  showTabs: {
    tree: true,
    explorer: true,
    code: true
  }
})
</script>
```

## Configuration Options

### Core Functionality

```typescript
interface JsonEditorOptions {
  // Enable/disable editing
  editable?: boolean // default: true
  
  // Validation behavior
  validationMode?: 'onChange' | 'onDemand' | 'disabled' // default: 'onChange'
}
```

### UI Configuration

```typescript
interface JsonEditorOptions {
  // Theme selection
  theme?: 'light' | 'dark' | 'auto' | string // default: 'light'
  
  // Tree view settings
  collapseDepth?: number // default: 2
  indentSize?: number // default: 20 (pixels)
  
  // Tab visibility
  showTabs?: {
    tree?: boolean // default: true
    explorer?: boolean // default: true  
    code?: boolean // default: true
  }
  
  // Default view when component loads
  defaultView?: 'tree' | 'explorer' | 'code' // default: 'tree'
}
```

### Feature Toggles

```typescript
interface JsonEditorOptions {
  // Smart string detection
  detectSpecialStrings?: {
    date?: boolean // default: true
    url?: boolean // default: true
    image?: boolean // default: true
    color?: boolean // default: true
  }
  
  // UI elements
  showValidationStatus?: boolean // default: true
  showLineNumbers?: boolean // default: false
  allowKeyboardNavigation?: boolean // default: true
  
  // Behavior
  autoSave?: boolean // default: false
  confirmDelete?: boolean // default: true
  expandArraysInitially?: boolean // default: true
  expandObjectsInitially?: boolean // default: true
}
```

### Custom Styling

```typescript
interface JsonEditorOptions {
  // CSS class to add to root element
  className?: string
  
  // Override CSS custom properties
  customCssProperties?: Record<string, string>
}
```

## Advanced Examples

### Minimal Editor (Code Only)

```vue
<JsonEditor
  v-model="jsonData"
  :options="{
    showTabs: {
      tree: false,
      explorer: false,
      code: true
    },
    defaultView: 'code',
    showValidationStatus: false
  }"
/>
```

### Read-Only Viewer

```vue
<JsonEditor
  v-model="jsonData"
  :options="{
    editable: false,
    validationMode: 'disabled',
    theme: 'dark',
    collapseDepth: 1
  }"
/>
```

### Custom Themed Editor

```vue
<JsonEditor
  v-model="jsonData"
  :options="{
    theme: 'custom',
    customCssProperties: {
      '--json-editor-bg-override': '#fdf6e3',
      '--json-editor-text-color-override': '#586e75',
      '--json-editor-border-color-override': '#eee8d5',
      '--json-type-string-bg-override': '#d33682',
      '--json-type-string-color-override': '#ffffff',
      '--json-type-number-bg-override': '#268bd2',
      '--json-type-number-color-override': '#ffffff'
    },
    className: 'solarized-theme'
  }"
/>
```

### Explorer-First Layout

```vue
<JsonEditor
  v-model="jsonData"
  :options="{
    defaultView: 'explorer',
    showTabs: {
      tree: false,
      explorer: true,
      code: true
    },
    indentSize: 24,
    collapseDepth: 3
  }"
/>
```

## CSS Custom Properties

You can override any aspect of the editor's appearance using CSS custom properties:

### Available CSS Variables

```css
/* Root element */
:root {
  /* Layout */
  --json-editor-border-radius: 8px;
  --json-editor-font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
  --json-editor-font-size: 13px;
  --json-editor-line-height: 1.6;
  
  /* Colors - Light Theme */
  --json-editor-bg-override: #ffffff;
  --json-editor-text-color-override: #1a202c;
  --json-editor-border-color-override: #e2e8f0;
  --json-editor-button-bg-override: #f7fafc;
  --json-editor-button-hover-bg-override: #edf2f7;
  --json-editor-button-active-bg-override: #4299e1;
  --json-editor-button-active-text-override: #ffffff;
  
  /* Type indicators */
  --json-type-string-bg-override: #dcfce7;
  --json-type-string-color-override: #166534;
  --json-type-number-bg-override: #dbeafe;
  --json-type-number-color-override: #1e40af;
  --json-type-boolean-bg-override: #f3e8ff;
  --json-type-boolean-color-override: #7c3aed;
  --json-type-null-bg-override: #f1f5f9;
  --json-type-null-color-override: #64748b;
  --json-type-object-bg-override: #fef3c7;
  --json-type-object-color-override: #92400e;
  --json-type-array-bg-override: #fee2e2;
  --json-type-array-color-override: #dc2626;
}
```

### Using CSS Variables

```css
/* Global override */
.my-json-editor {
  --json-editor-bg-override: #f0f9ff;
  --json-editor-border-radius: 12px;
  --json-type-string-bg-override: #ef4444;
  --json-type-string-color-override: white;
}

/* Or via component options */
```

```vue
<JsonEditor
  :options="{
    className: 'my-json-editor',
    customCssProperties: {
      '--json-editor-bg-override': '#f0f9ff',
      '--json-editor-border-radius': '12px'
    }
  }"
/>
```

## TypeScript Support

All options are fully typed for excellent IDE support:

```typescript
import type { JsonEditorOptions } from 'vue-json-edtr'

const options: JsonEditorOptions = {
  theme: 'dark', // ✅ Autocomplete available
  showTabs: {
    tree: true,
    explorer: false, // ✅ Type-safe
    code: true
  }
}
```

## Performance Considerations

- **Large JSON**: Use `collapseDepth: 0` for large objects
- **Read-only**: Set `editable: false` to disable editing features
- **Minimal UI**: Hide unused tabs with `showTabs` configuration
- **Validation**: Use `validationMode: 'onDemand'` for better performance with large schemas