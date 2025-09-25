export type JsonValue = string | number | boolean | null | JsonObject | JsonArray

export interface JsonObject {
  [key: string]: JsonValue
}

export type JsonArray = JsonValue[]

export type JsonPath = (string | number)[]

export interface JsonNode {
  id: string
  path: JsonPath
  key: string | number
  value: JsonValue
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'
  parent?: JsonNode
  children?: JsonNode[]
  isCollapsed?: boolean
  isEditable?: boolean
  isLazyLoaded?: boolean
  originalChildCount?: number
}

export interface JsonEditorOptions {
  // Core functionality
  editable?: boolean
  validationMode?: 'onChange' | 'onDemand' | 'disabled'
  
  // UI Configuration
  theme?: 'light' | 'dark' | 'auto' | string
  indentSize?: number
  
  
  // Feature toggles
  detectSpecialStrings?: {
    date?: boolean
    url?: boolean
    image?: boolean
    color?: boolean
  }
  showLineNumbers?: boolean
  allowKeyboardNavigation?: boolean
  
  // Styling
  customCssProperties?: Record<string, string>
  className?: string
  
  // Localization
  locale?: {
    saveChanges?: string
    addProperty?: string
    addItem?: string
    editValue?: string
    confirmDelete?: string
    cancel?: string
    loading?: string
    noChangesToSave?: string
    changesCount?: (count: number) => string
  }
  
  // Behavior
  autoSave?: boolean
  confirmDelete?: boolean
  expandArraysInitially?: boolean
  expandObjectsInitially?: boolean
  showSaveButton?: boolean
  showAddButton?: boolean
  collapseDepth?: number
  
  // Input validation and security
  inputValidation?: {
    enabled?: boolean
    maxStringLength?: number
    maxNumberValue?: number
    minNumberValue?: number
    maxObjectDepth?: number
    maxArrayLength?: number
    maxObjectKeys?: number
    sanitizeHtml?: boolean
    allowCircularReferences?: boolean
  }
}

export interface ValidationError {
  path: JsonPath
  message: string
  keyword?: string
  schemaPath?: string
}

export interface JsonEditorState {
  rootNode: JsonNode | null
  selectedPath: JsonPath | null
  validationErrors: ValidationError[]
  searchQuery: string
  searchResults: JsonPath[]
  history: JsonValue[]
  historyIndex: number
}