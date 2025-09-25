import { nextTick } from 'vue'

export function useMillerNavigation() {
  function autoScrollToColumn(targetColumnIndex: number) {
    const columnsContainer = document.querySelector('.miller-columns') as HTMLElement
    if (!columnsContainer) return

    const targetColumn = columnsContainer.children[targetColumnIndex] as HTMLElement
    if (!targetColumn) return

    const containerRect = columnsContainer.getBoundingClientRect()
    
    // Calculate if the target column is fully visible
    const targetLeft = targetColumn.offsetLeft
    const targetRight = targetLeft + targetColumn.offsetWidth
    const currentScrollLeft = columnsContainer.scrollLeft
    const visibleLeft = currentScrollLeft
    const visibleRight = currentScrollLeft + containerRect.width

    // Only scroll if the target column is not fully visible
    if (targetRight > visibleRight || targetLeft < visibleLeft) {
      let scrollLeft: number
      
      // If we can fit the entire column, center it
      if (targetColumn.offsetWidth <= containerRect.width) {
        scrollLeft = targetLeft - (containerRect.width - targetColumn.offsetWidth) / 2
      } else {
        // If column is wider than container, align to left
        scrollLeft = targetLeft - 20 // Small padding
      }
      
      // Ensure we don't scroll past the boundaries
      const maxScrollLeft = columnsContainer.scrollWidth - containerRect.width
      scrollLeft = Math.max(0, Math.min(scrollLeft, maxScrollLeft))
      
      columnsContainer.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      })
    }
  }

  function scrollToColumnAfterSelection(columnIndex: number) {
    // Use nextTick to ensure the new column is rendered
    nextTick(() => {
      setTimeout(() => {
        autoScrollToColumn(columnIndex + 1)
      }, 100)
    })
  }

  return {
    autoScrollToColumn,
    scrollToColumnAfterSelection
  }
}