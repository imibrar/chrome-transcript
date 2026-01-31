<script setup lang="ts">
import type { UserSettings } from '@/types'

const props = defineProps<{
  settings: UserSettings
}>()

const emit = defineEmits<{
  update: [key: keyof UserSettings, value: any]
}>()
</script>

<template>
  <div class="settings-panel">
    <div class="setting-item">
      <label class="setting-label">
        <input
          type="checkbox"
          :checked="settings.autoScroll"
          @change="emit('update', 'autoScroll', ($event.target as HTMLInputElement).checked)"
        />
        <span>Auto-scroll to current sentence</span>
      </label>
    </div>

    <div class="setting-item">
      <label class="setting-label">Theme</label>
      <select
        :value="settings.theme"
        @change="emit('update', 'theme', ($event.target as HTMLSelectElement).value)"
        class="setting-select"
      >
        <option value="auto">Auto (match YouTube)</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>

    <div class="shortcuts-section">
      <h4>Keyboard Shortcuts</h4>
      <div class="shortcuts-list">
        <div class="shortcut"><kbd>Space</kbd> Play/Pause</div>
        <div class="shortcut"><kbd>←</kbd> Previous sentence</div>
        <div class="shortcut"><kbd>→</kbd> Next sentence</div>
        <div class="shortcut"><kbd>R</kbd> Repeat sentence</div>
        <div class="shortcut"><kbd>-</kbd> Decrease speed</div>
        <div class="shortcut"><kbd>+</kbd> Increase speed</div>
        <div class="shortcut"><kbd>A</kbd> Set loop point A</div>
        <div class="shortcut"><kbd>B</kbd> Set loop point B</div>
        <div class="shortcut"><kbd>L</kbd> Toggle loop</div>
        <div class="shortcut"><kbd>Esc</kbd> Clear loop</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  padding: 16px;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
}

.setting-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-color);
}

.setting-select {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
}

.shortcuts-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.shortcuts-section h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted-text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.shortcuts-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.shortcut {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-color);
}

.shortcut kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 2px 6px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--subtle-bg);
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
}
</style>
