// Note: Using 'any' here to prevent TypeScript "excessively deep type instantiation" errors
// that occur with recursive type definitions like: JsonValue -> JsonObject -> JsonValue
export type JsonValue = any

export interface JsonObject {
  [key: string]: any
}

export type JsonArray = any[]

export type JsonPath = (string | number)[]

export interface JsonNode {
  id: string
  path: JsonPath
  key: string | number
  value: any // JsonValue causes circular reference, using any for compatibility
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
    phone?: boolean
    email?: boolean
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
    addNew?: string
    item?: string
    property?: string
    propertyName?: string
    stringType?: string
    numberType?: string
    booleanType?: string
    nullType?: string
    objectType?: string
    arrayType?: string
    add?: string
    root?: string
    items?: string
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