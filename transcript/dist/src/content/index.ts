import { createApp, h, ref, watch } from 'vue'
import { YouTubeObserver } from './youtube-observer'
import { PanelInjector } from './panel-injector'
import LearningPanel from '@/components/LearningPanel.vue'
import panelStyles from '@/assets/styles/panel.css?inline'

let app: ReturnType<typeof createApp> | null = null
let observer: YouTubeObserver | null = null
let injector: PanelInjector | null = null
let currentVideoId = ref<string | null>(null)

function detectYouTubeTheme(): 'light' | 'dark' {
  const html = document.documentElement
  const isDark = html.getAttribute('dark') !== null ||
    document.body.classList.contains('dark') ||
    getComputedStyle(document.body).backgroundColor.includes('33, 33, 33')
  return isDark ? 'dark' : 'light'
}

function mountApp(videoId: string) {
  if (!injector) {
    injector = new PanelInjector()
  }

  const result = injector.inject()
  if (!result) {
    // Retry after a delay if secondary column isn't available yet
    setTimeout(() => mountApp(videoId), 1000)
    return
  }

  const { shadowRoot } = result

  // Add styles to shadow DOM
  const style = document.createElement('style')
  style.textContent = panelStyles
  shadowRoot.appendChild(style)

  // Create app container
  const appContainer = document.createElement('div')
  appContainer.id = 'app'
  shadowRoot.appendChild(appContainer)

  // Apply theme
  const theme = detectYouTubeTheme()
  if (theme === 'dark') {
    shadowRoot.host.classList.add('dark')
  }

  // Watch for theme changes
  const themeObserver = new MutationObserver(() => {
    const newTheme = detectYouTubeTheme()
    if (newTheme === 'dark') {
      shadowRoot.host.classList.add('dark')
    } else {
      shadowRoot.host.classList.remove('dark')
    }
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['dark']
  })

  // Create and mount Vue app
  currentVideoId.value = videoId

  app = createApp({
    setup() {
      return () => h(LearningPanel, {
        videoId: currentVideoId.value
      })
    }
  })

  app.mount(appContainer)
}

function unmountApp() {
  if (app) {
    app.unmount()
    app = null
  }
  if (injector) {
    injector.remove()
  }
}

function handleVideoChange(videoId: string | null) {
  if (videoId) {
    if (!app) {
      mountApp(videoId)
    } else {
      // Update video ID for existing app
      currentVideoId.value = videoId
    }
  } else {
    unmountApp()
  }
}

// Initialize
function init() {
  observer = new YouTubeObserver(handleVideoChange)
  observer.start()
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}

// Cleanup on unload
window.addEventListener('unload', () => {
  observer?.stop()
  unmountApp()
})
