import JsonEditor from './components/JsonEditor.vue'

export { JsonEditor }
export default JsonEditor

export type {
  JsonValue,
  JsonObject,
  JsonArray,
  JsonPath,
  JsonNode as JsonNodeType,
  JsonEditorOptions,
  ValidationError,
  JsonEditorState
} from './types'

export {
  parseJsonToTree,
  treeToJson
} from './utils/json-model'

export {
  validateJson,
  inferSchema
} from './utils/json-validator'