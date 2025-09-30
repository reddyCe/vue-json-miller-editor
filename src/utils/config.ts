import type { JsonEditorOptions } from '../types'

export const DEFAULT_OPTIONS: Required<JsonEditorOptions> = {
  // Core functionality
  editable: true,
  validationMode: 'onChange',
  
  // UI Configuration
  theme: 'light',
  indentSize: 20,
  
  
  // Feature toggles
  detectSpecialStrings: {
    date: true,
    url: true,
    image: true,
    color: true,
    phone: true,
    email: true
  },
  showLineNumbers: false,
  allowKeyboardNavigation: true,
  
  // Styling
  customCssProperties: {},
  className: '',
  
  // Localization
  locale: {
    saveChanges: 'Save Changes',
    addProperty: 'Add Property',
    addItem: 'Add Item',
    editValue: 'Edit Value',
    confirmDelete: 'Are you sure?',
    cancel: 'Cancel',
    loading: 'Loading JSON data...',
    noChangesToSave: 'No changes to save',
    changesCount: (count: number) => `${count} change${count !== 1 ? 's' : ''}`,
    addNew: 'Add new',
    item: 'item',
    property: 'property',
    propertyName: 'Property name',
    stringType: 'String',
    numberType: 'Number',
    booleanType: 'Boolean',
    nullType: 'Null',
    objectType: 'Object',
    arrayType: 'Array',
    add: 'Add',
    root: 'Root',
    items: 'Items'
  },
  
  // Behavior
  autoSave: false,
  confirmDelete: true,
  expandArraysInitially: true,
  expandObjectsInitially: true,
  showSaveButton: true,
  showAddButton: true,
  collapseDepth: 3,
  
  // Input validation and security
  inputValidation: {
    enabled: false,
    maxStringLength: 10000,
    maxNumberValue: Number.MAX_SAFE_INTEGER,
    minNumberValue: Number.MIN_SAFE_INTEGER,
    maxObjectDepth: 50,
    maxArrayLength: 10000,
    maxObjectKeys: 1000,
    sanitizeHtml: true,
    allowCircularReferences: false
  }
}

export function mergeOptions(userOptions: Partial<JsonEditorOptions> = {}): Required<JsonEditorOptions> {
  return {
    ...DEFAULT_OPTIONS,
    ...userOptions,
    detectSpecialStrings: {
      ...DEFAULT_OPTIONS.detectSpecialStrings,
      ...userOptions.detectSpecialStrings
    },
    customCssProperties: {
      ...DEFAULT_OPTIONS.customCssProperties,
      ...userOptions.customCssProperties
    },
    locale: {
      ...DEFAULT_OPTIONS.locale,
      ...userOptions.locale
    },
    inputValidation: {
      ...DEFAULT_OPTIONS.inputValidation,
      ...userOptions.inputValidation
    }
  }
}

export function generateCssVariables(options: Required<JsonEditorOptions>): Record<string, string> {
  const baseVars: Record<string, string> = {
    '--json-editor-indent-size': `${options.indentSize}px`,
    '--json-editor-theme': options.theme,
  }
  
  // Theme-specific variables
  if (options.theme === 'light') {
    Object.assign(baseVars, {
      '--json-editor-bg': '#ffffff',
      '--json-editor-text-color': '#1a202c',
      '--json-editor-border-color': '#e2e8f0',
      '--json-editor-button-bg': '#f7fafc',
      '--json-editor-button-hover-bg': '#edf2f7',
      '--json-editor-button-active-bg': '#4299e1',
      '--json-editor-button-active-text': '#ffffff'
    })
  } else if (options.theme === 'dark') {
    Object.assign(baseVars, {
      '--json-editor-bg': '#1a202c',
      '--json-editor-text-color': '#f7fafc',
      '--json-editor-border-color': '#2d3748',
      '--json-editor-button-bg': '#2d3748',
      '--json-editor-button-hover-bg': '#4a5568',
      '--json-editor-button-active-bg': '#63b3ed',
      '--json-editor-button-active-text': '#1a202c'
    })
  }
  
  // Merge custom CSS properties
  return {
    ...baseVars,
    ...options.customCssProperties
  }
}