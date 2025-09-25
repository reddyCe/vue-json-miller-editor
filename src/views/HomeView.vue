<script setup lang="ts">
import { ref } from 'vue'
import JsonEditor from '../components/JsonEditor.vue'

const sampleData = ref({
  "id": "gls-it",
  "frontend": {
    "features": [
      {
        "name": "vehiclePanel",
        "roles": [
          "ECL_DEPOT",
          "DRIVER_SUPPORT",
          "SUBCONTRACTOR"
        ]
      }
    ],
    "businessHours": {
      "to": "20:30:00",
      "from": "08:00:00"
    },
    "colors": {
      "primary": "#007bff",
      "secondary": "#6c757d",
      "success": "#28a745",
      "danger": "#dc3545",
      "warning": "#ffc107",
      "info": "#17a2b8",
      "light": "#f8f9fa",
      "dark": "#343a40",
      "accent": "rgb(255, 99, 132)",
      "muted": "hsl(210, 7%, 56%)"
    },
    "specialValues": {
      "dates": {
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-03-20T14:45:30.123Z",
        "deploymentDate": "2024-12-25",
        "lastLogin": "Mon, 25 Dec 2024 13:30:00 GMT"
      },
      "urls": {
        "homepage": "https://jsoneditor.dev",
        "api": "https://api.example.com/v1/users",
        "docs": "http://localhost:3000/docs",
        "cdn": "https://cdn.jsdelivr.net/npm/vue@3.4.0/dist/vue.global.js"
      },
      "images": {
        "logo": "https://vuejs.org/logo.svg",
        "avatar": "https://github.com/octocat.png",
        "banner": "https://picsum.photos/800/200",
        "thumbnail": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkpTT048L3RleHQ+PC9zdmc+"
      },
      "emails": {
        "support": "support@example.com",
        "admin": "admin@company.org",
        "noreply": "noreply@notifications.app"
      },
      "phoneNumbers": {
        "office": "+1-555-123-4567",
        "mobile": "+44 20 7946 0958",
        "fax": "(555) 987-6543"
      },
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "elevation": 10.5
      },
      "flags": {
        "isEnabled": true,
        "isDevelopment": false,
        "hasPermissions": null,
        "debugMode": true
      },
      "numbers": {
        "userCount": 1250,
        "version": 3.14159,
        "ratio": 0.618,
        "percentage": 85.7,
        "negativeValue": -42
      }
    },
    "userManagement": {
      "backofficeUsers": {
        "roleMatrix": {},
        "grantableRolesByRole": {
          "PERMISSION_MANAGEMENT": [
            "DRIVER_DEVICE_MANAGEMENT",
            "DRIVER_SUPPORT",
            "PERMISSION_MANAGEMENT",
            "SUBCONTRACTOR"
          ]
        }
      }
    },
    "addEditUserFrom": {
      "usernameLabelKey": {
        "other": "addUserForm.labels.loginNo",
        "driver": "addUserForm.labels.loginNoUnique",
        "backOfficeUser": "addUserForm.labels.loginNoUnique_IT",
        "subContractorUser": "addUserForm.labels.loginNoUnique_IT"
      },
      "usernameRequired": "addUserForm.required.usernameRequired",
      "usernameFormatError": {
        "other": "addUserForm.required.usernameValid_IT",
        "backOfficeUser": {
          "key": "addUserForm.required.emailValid"
        }
      },
      "usernameFormatRegEx": {
        "other": "^[A-Z0-9]{2}[0-9]{4}$",
        "backOfficeUser": "\\S+@\\S+\\.\\S+"
      }
    },
    "addEditVehicleFrom": {
      "vehicleNoLabel": {
        "key": "addEditVehicleForm.labels.vehicleNo"
      },
      "vehicleNoCounter": 6,
      "vehicleNoRequired": {
        "key": "addEditVehicleForm.required.vehicleNo"
      },
      "vehicleNoFormatError": {
        "text": "Il numero del veicolo deve contenere 6 caratteri. I primi due caratteri possono essere alfanumerici."
      },
      "vehicleNoFormatRegEx": "^[A-Z0-9]{2}[0-9]{4}$"
    },
    "maxTemporaryUsersPerDepot": 30,
    "liveStatusShowLastUpdatedTime": false,
    "manualLiveDashboardRefreshActive": true,
    "liveDashboardRefreshIntervalInSec": 420
  },
  "metadata": {
    "version": "2.1.0",
    "environment": "production",
    "buildNumber": 12345,
    "features": [
      "json-validation",
      "tree-view",
      "miller-columns",
      "theme-support"
    ],
    "compatibility": {
      "vue": "^3.0.0",
      "typescript": "^5.0.0",
      "node": ">=18.0.0"
    }
  },
  "input-scanner": false,
  "input-vehicle": true,
  "emptyValues": {
    "nullValue": null,
    "emptyString": "",
    "emptyArray": [],
    "emptyObject": {}
  }
})

const sampleSchema = ref({
  type: "object",
  properties: {
    id: { type: "string", pattern: "^[a-z]+-[a-z]+$" },
    frontend: {
      type: "object",
      properties: {
        features: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              roles: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["name", "roles"]
          }
        },
        businessHours: {
          type: "object",
          properties: {
            to: { type: "string", pattern: "^[0-9]{2}:[0-9]{2}:[0-9]{2}$" },
            from: { type: "string", pattern: "^[0-9]{2}:[0-9]{2}:[0-9]{2}$" }
          },
          required: ["to", "from"]
        },
        colors: {
          type: "object",
          patternProperties: {
            ".*": {
              type: "string",
              pattern: "^(#[0-9a-fA-F]{6}|rgb\\(.*\\)|hsl\\(.*\\))$"
            }
          }
        },
        specialValues: {
          type: "object",
          properties: {
            dates: {
              type: "object",
              patternProperties: {
                ".*": {
                  type: "string",
                  format: "date-time"
                }
              }
            },
            urls: {
              type: "object",
              patternProperties: {
                ".*": {
                  type: "string",
                  format: "uri"
                }
              }
            },
            images: {
              type: "object",
              patternProperties: {
                ".*": {
                  type: "string",
                  format: "uri"
                }
              }
            },
            emails: {
              type: "object",
              patternProperties: {
                ".*": {
                  type: "string",
                  format: "email"
                }
              }
            },
            phoneNumbers: {
              type: "object",
              patternProperties: {
                ".*": {
                  type: "string",
                  pattern: "^[\\+]?[1-9]?[0-9]{7,15}$"
                }
              }
            },
            coordinates: {
              type: "object",
              properties: {
                latitude: { type: "number", minimum: -90, maximum: 90 },
                longitude: { type: "number", minimum: -180, maximum: 180 },
                elevation: { type: "number" }
              }
            },
            flags: {
              type: "object",
              patternProperties: {
                ".*": {
                  type: ["boolean", "null"]
                }
              }
            },
            numbers: {
              type: "object",
              patternProperties: {
                ".*": {
                  type: "number"
                }
              }
            }
          }
        },
        userManagement: {
          type: "object",
          properties: {
            backofficeUsers: {
              type: "object",
              properties: {
                roleMatrix: { type: "object" },
                grantableRolesByRole: {
                  type: "object",
                  patternProperties: {
                    ".*": {
                      type: "array",
                      items: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        },
        maxTemporaryUsersPerDepot: { type: "number", minimum: 0 },
        liveStatusShowLastUpdatedTime: { type: "boolean" },
        manualLiveDashboardRefreshActive: { type: "boolean" },
        liveDashboardRefreshIntervalInSec: { type: "number", minimum: 1 }
      },
      required: ["features", "businessHours"]
    },
    metadata: {
      type: "object",
      properties: {
        version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$" },
        environment: { type: "string", enum: ["development", "staging", "production"] },
        buildNumber: { type: "number", minimum: 1 },
        features: {
          type: "array",
          items: { type: "string" }
        },
        compatibility: {
          type: "object",
          patternProperties: {
            ".*": { type: "string" }
          }
        }
      },
      required: ["version", "environment"]
    },
    "input-scanner": { type: "boolean" },
    "input-vehicle": { type: "boolean" },
    emptyValues: {
      type: "object",
      properties: {
        nullValue: { type: "null" },
        emptyString: { type: "string", maxLength: 0 },
        emptyArray: { type: "array", maxItems: 0 },
        emptyObject: { type: "object", maxProperties: 0 }
      }
    }
  },
  required: ["id", "frontend"]
})

const currentTheme = ref<'light' | 'dark'>('light')
// Tabs removed - now only Miller Columns view
const editorOptions = ref({
  editable: true,
  validationMode: 'onChange' as const,
  indentSize: 20,
  detectSpecialStrings: {
    date: true,
    url: true,
    image: true,
    color: true,
    phone: true,
    email: true
  },
  theme: currentTheme.value,
  showSaveButton: true,
  customCssProperties: {
    '--json-editor-border-radius': '12px',
    '--json-editor-font-family': '\'JetBrains Mono\', monospace'
  }
})

function handleChange(newValue: any) {
  console.log('JSON changed:', newValue)
}

function handleValidate(errors: any[]) {
  console.log('Validation errors:', errors)
}

function handleError(error: Error) {
  console.error('Editor error:', error)
}

function toggleTheme() {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  editorOptions.value.theme = currentTheme.value
}

// Tab functionality removed with view consolidation

function updateIndentSize(event: Event) {
  const target = event.target as HTMLInputElement
  editorOptions.value.indentSize = parseInt(target.value)
}

</script>

<template>
  <div class="demo-container">
    <div class="demo-header">
      <h2>JSON Editor & Validator Demo</h2>
      <p>
        A Vue 3 component for viewing, editing, and validating JSON with a polished interface.
        Try editing values, adding/removing properties, and switching between tree and code views.
      </p>

      <div class="demo-controls">
        <div class="control-group">
          <h4>Theme</h4>
          <button @click="toggleTheme" class="control-btn">
            {{ currentTheme === 'light' ? 'Dark' : 'Light' }} Theme
          </button>
        </div>
      </div>
    </div>

    <div class="demo-content">
      <JsonEditor
        v-model="sampleData"
        :schema="sampleSchema"
        :options="editorOptions"
        @change="handleChange"
        @validate="handleValidate"
        @error="handleError"
      />
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  margin-bottom: 2rem;
}

.demo-header h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.demo-header p {
  color: #6c757d;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.demo-controls {
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.control-group {
  min-width: 200px;
}

.control-group h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.control-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.control-btn:hover {
  background: #0056b3;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  margin: 0;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slider-group label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.slider-group input[type="range"] {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #e9ecef;
  outline: none;
}

.slider-group input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
}

.slider-group input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
  border: none;
}

.demo-content {
  margin-bottom: 3rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.demo-features {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.demo-features h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.3rem;
}

.demo-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.demo-features li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.demo-features li:last-child {
  border-bottom: none;
}

.demo-features strong {
  color: #2c3e50;
}
</style>
