export class PanelInjector {
  private container: HTMLDivElement | null = null
  private shadowRoot: ShadowRoot | null = null

  inject(): { container: HTMLDivElement; shadowRoot: ShadowRoot } | null {
    // Remove existing panel if any
    this.remove()

    // Wait for secondary column to be available
    const secondary = this.findSecondaryColumn()
    if (!secondary) {
      console.warn('YouTube English Practice: Could not find secondary column')
      return null
    }

    // Create container with shadow DOM
    this.container = document.createElement('div')
    this.container.id = 'yt-english-practice-container'
    this.container.style.cssText = `
      margin-bottom: 16px;
      border-radius: 12px;
      overflow: hidden;
    `

    this.shadowRoot = this.container.attachShadow({ mode: 'open' })

    // Inject at the top of secondary column
    secondary.insertBefore(this.container, secondary.firstChild)

    return {
      container: this.container,
      shadowRoot: this.shadowRoot
    }
  }

  private findSecondaryColumn(): Element | null {
    // Try different selectors for YouTube's layout
    const selectors = [
      '#secondary-inner',
      '#secondary',
      'ytd-watch-flexy #secondary',
      '#related'
    ]

    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (element) {
        return element
      }
    }

    return null
  }

  remove(): void {
    if (this.container) {
      this.container.remove()
      this.container = null
      this.shadowRoot = null
    }

    // Also remove any orphaned containers
    const existing = document.getElementById('yt-english-practice-container')
    existing?.remove()
  }

  getContainer(): HTMLDivElement | null {
    return this.container
  }

  getShadowRoot(): ShadowRoot | null {
    return this.shadowRoot
  }

  isInjected(): boolean {
    return this.container !== null && document.contains(this.container)
  }
}
