# Vue JSON Editor & Validator

A clean, minimal Vue 3 component for editing and validating JSON with Miller Columns interface. Features a headerless design with focus on the editing experience.

[![npm version](https://badge.fury.io/js/vue-json-edtr.svg)](https://badge.fury.io/js/vue-json-edtr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

## ✨ Features

### 🌳 **Miller Columns Interface**
- **Explorer View** - Miller Columns navigation (macOS Finder-style)
- Intuitive hierarchical navigation
- Multi-column layout for easy browsing of nested structures

### ✏️ **Powerful Editing**
- Inline editing of primitive values
- Add/remove/rename object properties
- Add/remove/reorder array elements
- Real-time visual feedback for pending changes
- Undo/redo support

### ✅ **JSON Schema Validation**
- Real-time validation with [AJV](https://ajv.js.org/)
- Inline error display with path mapping
- Configurable validation modes (`onChange`, `onDemand`, `disabled`)
- Schema inference from JSON

### 🎨 **Clean & Minimal**
- Light/dark themes + custom themes  
- CSS custom properties for styling
- Clean, headerless interface
- Type-aware icons with color coding
- Smart rendering (dates, URLs, images, colors)

### 🚀 **Developer Experience**
- Full TypeScript support
- Vue 3 Composition API
- Lightweight and optimized (~45 kB gzipped)
- Extensive configuration options
- Comprehensive documentation

## 📦 Installation

```bash
npm install vue-json-miller-editor
```

## 🚀 Quick Start

```vue
<template>
  <JsonEditor
    v-model="jsonData"
    :schema="jsonSchema"
    :options="editorOptions"
    @change="handleChange"
    @save="handleSave"
    @validate="handleValidate"
  />
</template>

<script setup>
import { ref } from 'vue'
import { JsonEditor } from 'vue-json-miller-editor'
import 'vue-json-miller-editor/dist/vue-json-edtr.css'

const jsonData = ref({
  name: "John Doe",
  age: 30,
  active: true,
  hobbies: ["reading", "coding"],
  address: {
    street: "123 Main St",
    city: "New York"
  }
})

const jsonSchema = ref({
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number", minimum: 0 },
    active: { type: "boolean" },
    hobbies: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["name", "age"]
})

const editorOptions = ref({
  theme: 'light',
  editable: true,
  validationMode: 'onChange'
})

function handleChange(newValue) {
  console.log('JSON changed:', newValue)
}

function handleSave(changes, finalValue) {
  console.log('Changes saved:', changes)
  console.log('Final JSON:', finalValue)
}

function handleValidate(errors) {
  console.log('Validation errors:', errors)
}
</script>
```

## 🎛️ Configuration Options

### Basic Options

```typescript
interface JsonEditorOptions {
  // Core functionality
  editable?: boolean                    // default: true
  validationMode?: 'onChange' | 'onDemand' | 'disabled'  // default: 'onChange'
  
  // UI Configuration  
  theme?: 'light' | 'dark' | 'auto'    // default: 'light'
  indentSize?: number                  // default: 20 (pixels)
  
  
  // Feature toggles
  detectSpecialStrings?: {
    date?: boolean                     // default: true
    url?: boolean                      // default: true
    image?: boolean                    // default: true
    color?: boolean                    // default: true
  }
  showSaveButton?: boolean             // default: true
  showAddButton?: boolean              // default: true
  
  // Localization
  locale?: {
    saveChanges?: string               // default: 'Save Changes'
    addProperty?: string               // default: 'Add Property'
    addItem?: string                   // default: 'Add Item'
    editValue?: string                 // default: 'Edit Value'
    confirmDelete?: string             // default: 'Are you sure?'
    cancel?: string                    // default: 'Cancel'
    loading?: string                   // default: 'Loading JSON data...'
    noChangesToSave?: string           // default: 'No changes to save'
    changesCount?: (count: number) => string  // default: count => `${count} change${count !== 1 ? 's' : ''}`
  }
  
  // Custom styling
  customCssProperties?: Record<string, string>
  className?: string
}
```

## 🌍 Localization

You can customize all text labels in the interface:

```vue
<template>
  <JsonEditor
    v-model="jsonData"
    :options="{
      locale: {
        saveChanges: 'Guardar Cambios',
        addProperty: 'Añadir Propiedad',
        addItem: 'Añadir Elemento',
        editValue: 'Editar Valor',
        cancel: 'Cancelar',
        loading: 'Cargando datos JSON...'
      }
    }"
  />
</template>
```

### Default English Labels

```typescript
{
  saveChanges: 'Save Changes',
  addProperty: 'Add Property', 
  addItem: 'Add Item',
  editValue: 'Edit Value',
  confirmDelete: 'Are you sure?',
  cancel: 'Cancel',
  loading: 'Loading JSON data...',
  noChangesToSave: 'No changes to save',
  changesCount: (count: number) => `${count} change${count !== 1 ? 's' : ''}`
}
```

## 🎨 Styling & Themes

### Built-in Themes

```vue
<!-- Light theme (default) -->
<JsonEditor :options="{ theme: 'light' }" />

<!-- Dark theme -->
<JsonEditor :options="{ theme: 'dark' }" />
```

### Custom Themes

```vue
<JsonEditor :options="{
  theme: 'custom',
  customCssProperties: {
    '--json-editor-bg-override': '#fdf6e3',
    '--json-editor-text-color-override': '#586e75',
    '--json-type-string-bg-override': '#d33682',
    '--json-type-string-color-override': '#ffffff'
  }
}" />
```

### CSS Custom Properties

Override any aspect with CSS variables:

```css
:root {
  /* Layout */
  --json-editor-border-radius: 12px;
  --json-editor-font-family: 'JetBrains Mono', monospace;
  
  /* Colors */
  --json-editor-bg-override: #ffffff;
  --json-editor-text-color-override: #1a202c;
  --json-editor-border-color-override: #e2e8f0;
  
  /* Type indicators */
  --json-type-string-bg-override: #dcfce7;
  --json-type-string-color-override: #166534;
  --json-type-number-bg-override: #dbeafe;
  --json-type-number-color-override: #1e40af;
  /* ... and 20+ more variables */
}
```

## 📋 Usage Examples

### Minimal Code Editor

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

### Custom Actions Control

```vue
<!-- Hide all action buttons - actions section won't show -->
<JsonEditor 
  v-model="jsonData"
  :options="{
    showSaveButton: false,
    showAddButton: false
  }"
/>

<!-- Show only save button -->
<JsonEditor 
  v-model="jsonData"
  :options="{
    showSaveButton: true,
    showAddButton: false
  }"
/>
```

### Explorer-First Layout

```vue
<JsonEditor 
  v-model="jsonData"
  :options="{
    defaultView: 'explorer',
    showTabs: { tree: false, explorer: true, code: true },
    indentSize: 24,
    collapseDepth: 3
  }"
/>
```

### Custom Styled Editor

```vue
<JsonEditor 
  v-model="jsonData"
  :options="{
    className: 'my-custom-editor',
    customCssProperties: {
      '--json-editor-bg-override': '#f0f9ff',
      '--json-editor-border-radius': '16px',
      '--json-type-string-bg-override': '#ef4444',
      '--json-type-string-color-override': 'white'
    }
  }"
/>
```

## 🔧 Advanced Features

### Schema Validation

```vue
<template>
  <JsonEditor
    v-model="userData"
    :schema="userSchema"
    :options="{ validationMode: 'onChange' }"
    @validate="handleValidation"
  />
</template>

<script setup>
const userSchema = ref({
  type: "object",
  properties: {
    email: { 
      type: "string", 
      format: "email" 
    },
    age: { 
      type: "number", 
      minimum: 0, 
      maximum: 120 
    },
    preferences: {
      type: "object",
      properties: {
        theme: { 
          type: "string", 
          enum: ["light", "dark"] 
        }
      }
    }
  },
  required: ["email"]
})

function handleValidation(errors) {
  if (errors.length > 0) {
    console.log('Validation failed:', errors)
  } else {
    console.log('JSON is valid!')
  }
}
</script>
```

### Event Handling

```vue
<JsonEditor
  v-model="jsonData"
  @change="handleChange"
  @validate="handleValidate"
  @error="handleError"
/>

<script setup>
function handleChange(newValue) {
  // Called whenever JSON changes
  console.log('New value:', newValue)
}

function handleValidate(errors) {
  // Called after validation
  console.log('Validation errors:', errors)
}

function handleError(error) {
  // Called on any errors
  console.error('Editor error:', error)
}
</script>
```

## 📚 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `JsonValue` | - | The JSON data to edit (v-model) |
| `schema` | `object` | `undefined` | JSON Schema for validation |
| `options` | `JsonEditorOptions` | `{}` | Configuration options |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `JsonValue` | Emitted when JSON changes (v-model) |
| `change` | `JsonValue` | Emitted immediately when any value is edited |
| `save` | `changes[], finalValue` | Emitted when "Save all changes" is clicked |
| `validate` | `ValidationError[]` | Emitted after validation |
| `error` | `Error` | Emitted on errors |

### Event Details

- **`@change`**: Fires immediately when any value is edited (before saving)
- **`@save`**: Fires only when the user clicks "Save all changes" button
  - `changes`: Array of all pending changes with paths, old/new values
  - `finalValue`: Complete JSON object after all changes applied

### Using Custom Save Logic

You can hide the built-in save button and implement your own save logic:

```vue
<template>
  <JsonEditor
    v-model="jsonData"
    :options="{ showSaveButton: false }"
    @change="handleChange"
  />
  
  <!-- Your custom save button -->
  <button @click="saveData" :disabled="!hasChanges">
    Save Changes
  </button>
</template>

<script setup>
const hasChanges = ref(false)

function handleChange(newValue) {
  hasChanges.value = true
  // Your custom change handling logic
}

function saveData() {
  // Your custom save logic
  hasChanges.value = false
}
</script>
```

### Types

```typescript
type JsonValue = string | number | boolean | null | JsonObject | JsonArray

interface JsonObject {
  [key: string]: JsonValue
}

interface JsonArray extends Array<JsonValue> {}

interface ValidationError {
  path: (string | number)[]
  message: string
  keyword?: string
  schemaPath?: string
}
```

## 🏗️ Development

```bash
# Clone the repository
git clone https://github.com/your-username/vue-json-editor.git
cd vue-json-editor

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📖 Documentation

- [Configuration Guide](./CONFIGURATION.md) - Detailed configuration options
- [Examples](./examples/) - More usage examples
- [API Reference](./docs/api.md) - Complete API documentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [JSON Hero](https://jsonhero.io/) for the visual design concepts
- Built with [Vue 3](https://vuejs.org/) and [TypeScript](https://www.typescriptlang.org/)
- JSON Schema validation powered by [AJV](https://ajv.js.org/)
- Miller Columns UI inspired by macOS Finder

## 📊 Bundle Size

- **ES Module**: ~338 kB (~68 kB gzipped)
- **UMD Module**: ~171 kB (~48 kB gzipped)
- **CSS**: ~39 kB (~6 kB gzipped)
- **Dependencies**: AJV, AJV-formats
- **Peer Dependencies**: Vue 3.3+

---

**Made with ❤️ for the Vue.js community**