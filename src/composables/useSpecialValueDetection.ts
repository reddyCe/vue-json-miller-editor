import type { JsonValue, JsonEditorOptions } from '../types'

export interface SpecialValueDetector {
  name: string
  icon: string
  detect: (value: string) => boolean
  preview?: (value: string) => string
  tooltip?: (value: string) => string
}

// Built-in detectors
const builtInDetectors: SpecialValueDetector[] = [
  {
    name: 'date',
    icon: '📅',
    detect: (str: string): boolean => {
      const date = new Date(str)
      return !isNaN(date.getTime()) && str.includes('T')
    },
    preview: (str: string): string => {
      return `📅 ${new Date(str).toLocaleDateString()}`
    },
    tooltip: (str: string): string => {
      return `Date: ${new Date(str).toLocaleString()}`
    }
  },
  {
    name: 'url',
    icon: '🔗',
    detect: (str: string): boolean => {
      try {
        new URL(str)
        return true
      } catch {
        return false
      }
    },
    preview: (_str: string): string => '🔗 Link',
    tooltip: (str: string): string => `URL: ${str}`
  },
  {
    name: 'image',
    icon: '🖼️',
    detect: (str: string): boolean => {
      try {
        new URL(str)
        return /\.(jpg|jpeg|png|gif|svg|webp|bmp|ico)$/i.test(str)
      } catch {
        return false
      }
    },
    preview: (_str: string): string => '🖼️ Image',
    tooltip: (str: string): string => `Image: ${str}`
  },
  {
    name: 'color',
    icon: '🎨',
    detect: (str: string): boolean => {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(str) ||
             /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(str) ||
             /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i.test(str)
    },
    preview: (str: string): string => `🎨 ${str}`,
    tooltip: (str: string): string => `Color: ${str}`
  },
  {
    name: 'phone',
    icon: '📞',
    detect: (str: string): boolean => {
      // Remove all non-digit characters for length check
      const digitsOnly = str.replace(/\D/g, '')
      
      // Must have 7-15 digits (international standard)
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return false
      }
      
      // Common phone number patterns
      const phonePatterns = [
        /^\+?[1-9]\d{1,14}$/, // International format: +1234567890
        /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/, // US format
        /^\+?44[-.\s]?[0-9]{2,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}$/, // UK format
        /^\+?[0-9]{1,4}[-.\s]?\(?[0-9]{2,4}\)?[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}$/ // Generic international
      ]
      
      return phonePatterns.some(pattern => pattern.test(str))
    },
    preview: (_str: string): string => '📞 Phone',
    tooltip: (str: string): string => `Phone: ${str}`
  },
  {
    name: 'email',
    icon: '📧',
    detect: (str: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(str)
    },
    preview: (_str: string): string => '📧 Email',
    tooltip: (str: string): string => `Email: ${str}`
  }
]

export interface SpecialValueResult {
  type: string
  icon: string
  preview: string
  tooltip: string
}

export interface ValidationResult {
  isValid: boolean
  originalType?: string
  expectedType?: string
  warning?: string
}

export function useSpecialValueDetection(
  options?: JsonEditorOptions,
  customDetectors: SpecialValueDetector[] = []
) {
  // Combine built-in and custom detectors
  const allDetectors = [...builtInDetectors, ...customDetectors]
  
  /**
   * Detect special value type and return preview information
   */
  function detectSpecialValue(value: JsonValue): SpecialValueResult | null {
    if (typeof value !== 'string') return null
    if (!options?.detectSpecialStrings) return null
    
    const str = value as string
    
    // Check each detector
    for (const detector of allDetectors) {
      // Check if this detector type is enabled in options
      const isEnabled = options.detectSpecialStrings?.[detector.name as keyof typeof options.detectSpecialStrings]
      if (!isEnabled) continue
      
      // Check if value matches this detector
      if (detector.detect(str)) {
        return {
          type: detector.name,
          icon: detector.icon,
          preview: detector.preview?.(str) || `${detector.icon} ${detector.name}`,
          tooltip: detector.tooltip?.(str) || `${detector.name}: ${str}`
        }
      }
    }
    
    return null
  }
  
  /**
   * Check if a value is a special type
   */
  function isSpecialValue(value: JsonValue): boolean {
    return detectSpecialValue(value) !== null
  }
  
  /**
   * Get just the preview string for a value
   */
  function getSpecialValuePreview(value: JsonValue): string | null {
    const result = detectSpecialValue(value)
    return result?.preview || null
  }
  
  /**
   * Get just the tooltip for a value
   */
  function getSpecialValueTooltip(value: JsonValue): string | null {
    const result = detectSpecialValue(value)
    return result?.tooltip || null
  }
  
  /**
   * Add a custom detector (useful for extending functionality)
   */
  function addCustomDetector(detector: SpecialValueDetector): void {
    customDetectors.push(detector)
  }
  
  /**
   * Validate if a new value maintains the same special type as the original
   */
  function validateValueTypeChange(originalValue: JsonValue, newValue: string): ValidationResult {
    // Get the original special type
    const originalResult = detectSpecialValue(originalValue)
    
    if (!originalResult) {
      // Original wasn't a special type, so any change is valid
      return { isValid: true }
    }
    
    // Check if new value matches the same special type
    const newResult = detectSpecialValue(newValue)
    
    if (!newResult) {
      // New value is not a special type, but original was
      return {
        isValid: false,
        originalType: originalResult.type,
        expectedType: originalResult.type,
        warning: `This value was detected as a ${originalResult.type} (${originalResult.preview}). The new value doesn't appear to be a valid ${originalResult.type}.`
      }
    }
    
    if (newResult.type !== originalResult.type) {
      // New value is a different special type
      return {
        isValid: false,
        originalType: originalResult.type,
        expectedType: originalResult.type,
        warning: `This value was originally a ${originalResult.type} but the new value appears to be a ${newResult.type}. This may not be what you intended.`
      }
    }
    
    // Both values are the same special type
    return { 
      isValid: true,
      originalType: originalResult.type,
      expectedType: originalResult.type
    }
  }
  
  /**
   * Get validation warning message for a type change
   */
  function getTypeChangeWarning(originalValue: JsonValue, newValue: string): string | null {
    const validation = validateValueTypeChange(originalValue, newValue)
    return validation.warning || null
  }
  
  /**
   * Check if a value change would break special type consistency
   */
  function wouldBreakSpecialType(originalValue: JsonValue, newValue: string): boolean {
    return !validateValueTypeChange(originalValue, newValue).isValid
  }
  
  /**
   * Get all available detectors
   */
  function getAvailableDetectors(): SpecialValueDetector[] {
    return [...allDetectors]
  }
  
  return {
    detectSpecialValue,
    isSpecialValue,
    getSpecialValuePreview,
    getSpecialValueTooltip,
    addCustomDetector,
    getAvailableDetectors,
    validateValueTypeChange,
    getTypeChangeWarning,
    wouldBreakSpecialType
  }
}

// Export individual detector functions for direct use if needed
export const detectors = {
  isDateString: (str: string): boolean => builtInDetectors[0].detect(str),
  isUrlString: (str: string): boolean => builtInDetectors[1].detect(str),
  isImageUrl: (str: string): boolean => builtInDetectors[2].detect(str),
  isColorString: (str: string): boolean => builtInDetectors[3].detect(str),
  isPhoneNumber: (str: string): boolean => builtInDetectors[4].detect(str),
  isEmail: (str: string): boolean => builtInDetectors[5].detect(str)
}