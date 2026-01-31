type VideoChangeCallback = (videoId: string | null) => void

export class YouTubeObserver {
  private callback: VideoChangeCallback
  private currentVideoId: string | null = null
  private observer: MutationObserver | null = null
  private originalPushState: typeof history.pushState
  private originalReplaceState: typeof history.replaceState

  constructor(callback: VideoChangeCallback) {
    this.callback = callback
    this.originalPushState = history.pushState.bind(history)
    this.originalReplaceState = history.replaceState.bind(history)
  }

  start(): void {
    // Intercept history methods for SPA navigation
    history.pushState = (...args) => {
      this.originalPushState(...args)
      this.checkForVideo()
    }

    history.replaceState = (...args) => {
      this.originalReplaceState(...args)
      this.checkForVideo()
    }

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', () => this.checkForVideo())

    // Observe title changes as a fallback
    this.observer = new MutationObserver(() => this.checkForVideo())

    const titleElement = document.querySelector('title')
    if (titleElement) {
      this.observer.observe(titleElement, { childList: true })
    }

    // Also observe the main content for YouTube's dynamic loading
    const ytdApp = document.querySelector('ytd-app')
    if (ytdApp) {
      this.observer.observe(ytdApp, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['video-id']
      })
    }

    // Initial check
    this.checkForVideo()
  }

  stop(): void {
    history.pushState = this.originalPushState
    history.replaceState = this.originalReplaceState
    window.removeEventListener('popstate', () => this.checkForVideo())
    this.observer?.disconnect()
  }

  private checkForVideo(): void {
    const videoId = this.extractVideoId()

    if (videoId !== this.currentVideoId) {
      this.currentVideoId = videoId
      this.callback(videoId)
    }
  }

  private extractVideoId(): string | null {
    const url = new URL(window.location.href)

    // Watch page
    if (url.pathname === '/watch') {
      return url.searchParams.get('v')
    }

    // Shorts
    if (url.pathname.startsWith('/shorts/')) {
      return url.pathname.split('/shorts/')[1]?.split('/')[0] || null
    }

    // Embed
    if (url.pathname.startsWith('/embed/')) {
      return url.pathname.split('/embed/')[1]?.split('/')[0] || null
    }

    return null
  }

  getCurrentVideoId(): string | null {
    return this.currentVideoId
  }
}
