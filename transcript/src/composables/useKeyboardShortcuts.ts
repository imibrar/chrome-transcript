import { onMounted, onUnmounted } from 'vue'

export interface KeyboardActions {
  togglePlay: () => void
  previousSentence: () => void
  nextSentence: () => void
  repeatSentence: () => void
  decreaseSpeed: () => void
  increaseSpeed: () => void
  setPointA: () => void
  setPointB: () => void
  toggleLoop: () => void
  clearLoop: () => void
}

export function useKeyboardShortcuts(actions: KeyboardActions) {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't trigger if typing in an input field
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable ||
      target.closest('#contenteditable-root')
    ) {
      return
    }

    // Don't interfere with YouTube's native shortcuts when not focused on our panel
    const isInPanel = target.closest('#yt-english-practice-container')

    switch (e.key.toLowerCase()) {
      case ' ':
        if (isInPanel) {
          e.preventDefault()
          actions.togglePlay()
        }
        break

      case 'arrowleft':
        if (isInPanel || e.shiftKey) {
          e.preventDefault()
          actions.previousSentence()
        }
        break

      case 'arrowright':
        if (isInPanel || e.shiftKey) {
          e.preventDefault()
          actions.nextSentence()
        }
        break

      case 'r':
        if (isInPanel) {
          e.preventDefault()
          actions.repeatSentence()
        }
        break

      case '-':
      case '_':
        if (isInPanel) {
          e.preventDefault()
          actions.decreaseSpeed()
        }
        break

      case '=':
      case '+':
        if (isInPanel) {
          e.preventDefault()
          actions.increaseSpeed()
        }
        break

      case 'a':
        if (isInPanel) {
          e.preventDefault()
          actions.setPointA()
        }
        break

      case 'b':
        if (isInPanel) {
          e.preventDefault()
          actions.setPointB()
        }
        break

      case 'l':
        if (isInPanel) {
          e.preventDefault()
          actions.toggleLoop()
        }
        break

      case 'escape':
        if (isInPanel) {
          e.preventDefault()
          actions.clearLoop()
        }
        break
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}
