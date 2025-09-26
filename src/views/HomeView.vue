<script setup lang="ts">
import { ref } from 'vue'
import JsonEditor from '../components/JsonEditor.vue'

const sampleData = ref({
  "id": "gls-it",

  // Test complex schema composition with allOf
  "adminUser": {
    "name": "John Admin",
    "age": 35,
    "email": "john.admin@example.com",
    "isActive": true,
    "role": "admin",
    "permissions": ["read", "write", "delete", "admin"],
    "lastLogin": "2024-12-25T10:30:00Z"
  },

  // Test conditional validation (adult user with INVALID email to test validation)
  "user": {
    "name": "Jane Doe",
    "age": 25,
    "email": "invalid-email-format",
    "isActive": true,
    "drivingLicense": "ABC123456789",
    "canVote": true
  },

  // Test anyOf with email contact
  "contact": {
    "type": "email",
    "value": "contact@example.com"
  },

  // Test oneOf with credit card payment (INVALID card number - too short)
  "paymentMethod": {
    "type": "credit_card",
    "cardNumber": "123456789012345",
    "expiryDate": "12/25"
  },

  // Test complex nested validation with dependencies
  "configuration": {
    "database": {
      "type": "postgresql",
      "host": "localhost",
      "port": 5432,
      "sslmode": "require"
    },
    "features": {
      "authentication": true,
      "logging": false,
      "caching": true
    }
  },

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
  definitions: {
    "PersonSchema": {
      type: "object",
      properties: {
        name: { type: "string", minLength: 2, maxLength: 50 },
        age: { type: "integer", minimum: 0, maximum: 150 },
        email: { type: "string", format: "email" },
        isActive: { type: "boolean" }
      },
      required: ["name", "age"]
    },
    "AddressSchema": {
      type: "object",
      properties: {
        street: { type: "string", minLength: 1 },
        city: { type: "string", minLength: 1 },
        country: {
          type: "string",
          enum: ["USA", "Canada", "UK", "Germany", "France", "Italy"]
        },
        postalCode: {
          type: "string",
          pattern: "^[A-Z0-9]{3,10}$"
        }
      },
      required: ["street", "city", "country"]
    }
  },
  properties: {
    id: { type: "string", pattern: "^[a-z]+-[a-z]+$" },

    // Advanced schema composition with allOf
    adminUser: {
      allOf: [
        { "$ref": "#/definitions/PersonSchema" },
        {
          properties: {
            role: { const: "admin" },
            permissions: {
              type: "array",
              items: {
                type: "string",
                enum: ["read", "write", "delete", "admin"]
              },
              minItems: 1,
              uniqueItems: true
            },
            lastLogin: { type: "string", format: "date-time" }
          },
          required: ["role", "permissions"]
        }
      ]
    },

    // Conditional validation with if/then/else
    user: {
      type: "object",
      allOf: [
        { "$ref": "#/definitions/PersonSchema" }
      ],
      if: {
        properties: { age: { minimum: 18 } }
      },
      then: {
        properties: {
          drivingLicense: { type: "string", pattern: "^[A-Z0-9]{8,12}$" },
          canVote: { const: true }
        },
        required: ["drivingLicense"]
      },
      else: {
        properties: {
          guardian: { "$ref": "#/definitions/PersonSchema" },
          schoolGrade: { type: "integer", minimum: 1, maximum: 12 }
        },
        required: ["guardian"]
      }
    },

    // Complex anyOf with multiple valid schemas
    contact: {
      anyOf: [
        {
          properties: {
            type: { const: "email" },
            value: { type: "string", format: "email" }
          },
          required: ["type", "value"]
        },
        {
          properties: {
            type: { const: "phone" },
            value: { type: "string", pattern: "^\\+?[1-9]\\d{1,14}$" }
          },
          required: ["type", "value"]
        },
        {
          properties: {
            type: { const: "address" },
            value: { "$ref": "#/definitions/AddressSchema" }
          },
          required: ["type", "value"]
        }
      ]
    },

    // oneOf for exclusive choices
    paymentMethod: {
      oneOf: [
        {
          properties: {
            type: { const: "credit_card" },
            cardNumber: { type: "string", pattern: "^[0-9]{16}$" },
            expiryDate: { type: "string", pattern: "^(0[1-9]|1[0-2])\\/[0-9]{2}$" }
          },
          required: ["type", "cardNumber", "expiryDate"]
        },
        {
          properties: {
            type: { const: "paypal" },
            paypalEmail: { type: "string", format: "email" }
          },
          required: ["type", "paypalEmail"]
        },
        {
          properties: {
            type: { const: "bank_transfer" },
            iban: { type: "string", pattern: "^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$" },
            bic: { type: "string", pattern: "^[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3})?$" }
          },
          required: ["type", "iban"]
        }
      ]
    },

    // Complex nested validation with dependencies
    configuration: {
      type: "object",
      properties: {
        database: {
          type: "object",
          properties: {
            type: { enum: ["mysql", "postgresql", "mongodb"] },
            host: { type: "string", format: "hostname" },
            port: { type: "integer", minimum: 1, maximum: 65535 }
          },
          dependencies: {
            type: {
              oneOf: [
                {
                  properties: {
                    type: { const: "mysql" },
                    charset: { enum: ["utf8", "utf8mb4", "latin1"] }
                  }
                },
                {
                  properties: {
                    type: { const: "postgresql" },
                    sslmode: { enum: ["disable", "require", "verify-ca", "verify-full"] }
                  }
                },
                {
                  properties: {
                    type: { const: "mongodb" },
                    replicaSet: { type: "string" },
                    authSource: { type: "string" }
                  }
                }
              ]
            }
          }
        },
        features: {
          type: "object",
          properties: {
            authentication: { type: "boolean" },
            logging: { type: "boolean" },
            caching: { type: "boolean" }
          },
          additionalProperties: false
        }
      }
    },

    // Original simpler properties for comparison
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
        }
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
  sampleData.value = newValue
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
  width: 100%;
}

.demo-header {
  margin-bottom: 3rem;
  text-align: center;
}

.demo-header h2 {
  margin-bottom: 1.5rem;
  color: var(--color-heading);
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.demo-header p {
  color: var(--color-text-muted);
  font-size: 1.125rem;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.demo-controls {
  margin-bottom: 3rem;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 2rem;
  background: var(--color-surface-elevated);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(10px);
}

.control-group {
  min-width: 200px;
  text-align: center;
}

.control-group h4 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.control-btn {
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.control-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.control-btn:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
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
  margin-bottom: 4rem;
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
}

.demo-features {
  background: var(--color-surface-elevated);
  padding: 2.5rem;
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.demo-features h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--color-heading);
  font-size: 1.5rem;
  font-weight: 700;
}

.demo-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.demo-features li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.15s ease-in-out;
}

.demo-features li:hover {
  padding-left: 0.5rem;
  background: rgba(59, 130, 246, 0.04);
  border-radius: var(--border-radius-sm);
}

.demo-features li:last-child {
  border-bottom: none;
}

.demo-features strong {
  color: var(--color-heading);
  font-weight: 600;
}
</style>
