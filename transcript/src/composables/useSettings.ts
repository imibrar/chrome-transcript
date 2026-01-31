import { ref, watch, readonly, onMounted } from 'vue'
import type { UserSettings } from '@/types'

const STORAGE_KEY = 'yt-english-practice-settings'

const defaultSettings: UserSettings = {
  autoScroll: true,
  playbackSpeed: 1,
  panelCollapsed: false,
  theme: 'auto'
}

export function useSettings() {
  const settings = ref<UserSettings>({ ...defaultSettings })
  const loaded = ref(false)

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY)
      if (result[STORAGE_KEY]) {
        settings.value = { ...defaultSettings, ...result[STORAGE_KEY] }
      }
    } catch {
      settings.value = { ...defaultSettings }
    }
    loaded.value = true
  }

  const saveSettings = async () => {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: settings.value })
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    settings.value[key] = value
  }

  const resetSettings = async () => {
    settings.value = { ...defaultSettings }
    await saveSettings()
  }

  // Auto-save when settings change
  watch(
    settings,
    () => {
      if (loaded.value) {
        saveSettings()
      }
    },
    { deep: true }
  )

  onMounted(() => {
    loadSettings()
  })

  return {
    // State
    settings: readonly(settings),
    loaded: readonly(loaded),

    // Methods
    loadSettings,
    updateSetting,
    resetSettings
  }
}
