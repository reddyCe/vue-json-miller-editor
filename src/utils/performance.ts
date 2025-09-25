import type { JsonValue, JsonNode } from '../types'

export interface PerformanceOptions {
  maxNodes?: number
  virtualScrollThreshold?: number
  debounceMs?: number
  lazyLoadingDepth?: number
}

export const DEFAULT_PERFORMANCE_OPTIONS: Required<PerformanceOptions> = {
  maxNodes: 10000,
  virtualScrollThreshold: 1000,
  debounceMs: 300,
  lazyLoadingDepth: 3
}

/**
 * Counts the total number of nodes in a JSON structure
 */
export function countJsonNodes(value: JsonValue): number {
  if (value === null || typeof value !== 'object') {
    return 1
  }

  let count = 1 // Count the current node

  if (Array.isArray(value)) {
    for (const item of value) {
      count += countJsonNodes(item)
    }
  } else {
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        count += countJsonNodes(value[key])
      }
    }
  }

  return count
}

/**
 * Checks if JSON data is large and might need performance optimizations
 */
export function isLargeJson(value: JsonValue, options = DEFAULT_PERFORMANCE_OPTIONS): boolean {
  const nodeCount = countJsonNodes(value)
  return nodeCount > options.maxNodes
}

/**
 * Creates a debounced version of a function
 */
export function debounce<TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => TReturn,
  wait: number
): (...args: TArgs) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: TArgs) => {
    if (timeout !== null) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, wait)
  }
}

/**
 * Creates a throttled version of a function
 */
export function throttle<TArgs extends unknown[], TReturn>(
  func: (...args: TArgs) => TReturn,
  wait: number
): (...args: TArgs) => void {
  let inThrottle: boolean
  let lastFunc: ReturnType<typeof setTimeout>
  let lastRan: number

  return (...args: TArgs) => {
    if (!inThrottle) {
      func(...args)
      lastRan = Date.now()
      inThrottle = true
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= wait) {
          func(...args)
          lastRan = Date.now()
        }
      }, Math.max(wait - (Date.now() - lastRan), 0))
    }
  }
}

/**
 * Creates a lazy-loading node that only expands children when needed
 */
export function createLazyNode(
  originalNode: JsonNode,
  depth: number,
  lazyDepth: number
): JsonNode {
  if (depth < lazyDepth || !originalNode.children) {
    return originalNode
  }

  return {
    ...originalNode,
    children: undefined,
    isCollapsed: true,
    isLazyLoaded: true,
    originalChildCount: originalNode.children.length
  }
}

/**
 * Measures performance of a function execution
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  if (import.meta.env.DEV) {
    console.log(`[JsonEditor] ${name} took ${(end - start).toFixed(2)}ms`)
  }
  
  return result
}

/**
 * Batches DOM updates using requestAnimationFrame
 */
export function batchUpdates(callback: () => void): void {
  requestAnimationFrame(callback)
}

/**
 * Creates a virtual scrolling helper for large lists
 */
export class VirtualScrollHelper {
  private itemHeight: number
  private containerHeight: number
  private scrollTop: number = 0
  private totalItems: number = 0

  constructor(itemHeight: number, containerHeight: number) {
    this.itemHeight = itemHeight
    this.containerHeight = containerHeight
  }

  setScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop
  }

  setTotalItems(count: number): void {
    this.totalItems = count
  }

  getVisibleRange(): { start: number; end: number; offset: number } {
    const start = Math.floor(this.scrollTop / this.itemHeight)
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight)
    const end = Math.min(start + visibleCount + 2, this.totalItems) // +2 for buffer
    const offset = start * this.itemHeight

    return { start, end, offset }
  }

  getTotalHeight(): number {
    return this.totalItems * this.itemHeight
  }
}

/**
 * Memory-efficient JSON stringifier for large objects
 */
export function safeStringify(
  value: JsonValue,
  maxDepth: number = 10,
  currentDepth: number = 0
): string {
  if (currentDepth >= maxDepth) {
    return '"[Object depth limit exceeded]"'
  }

  if (value === null) return 'null'
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    const items = value.slice(0, 100).map(item => 
      safeStringify(item, maxDepth, currentDepth + 1)
    )
    if (value.length > 100) {
      items.push('"[... ' + (value.length - 100) + ' more items]"')
    }
    return `[${items.join(',')}]`
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value).slice(0, 50)
    const items = entries.map(([k, v]) => 
      `${JSON.stringify(k)}:${safeStringify(v, maxDepth, currentDepth + 1)}`
    )
    if (Object.keys(value).length > 50) {
      items.push('"[... ' + (Object.keys(value).length - 50) + ' more properties]"')
    }
    return `{${items.join(',')}}`
  }

  return '"[Unknown type]"'
}

/**
 * Checks if the current environment supports modern performance features
 */
export function supportsPerformanceFeatures(): {
  requestIdleCallback: boolean
  intersectionObserver: boolean
  performanceObserver: boolean
} {
  return {
    requestIdleCallback: typeof requestIdleCallback !== 'undefined',
    intersectionObserver: typeof IntersectionObserver !== 'undefined',
    performanceObserver: typeof PerformanceObserver !== 'undefined'
  }
}