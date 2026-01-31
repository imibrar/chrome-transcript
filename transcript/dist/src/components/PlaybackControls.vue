<script setup lang="ts">
import type { SpeedOption } from '@/types'

const props = defineProps<{
  playing: boolean
  playbackRate: number
  canGoPrevious: boolean
  canGoNext: boolean
}>()

const emit = defineEmits<{
  togglePlay: []
  previous: []
  next: []
  repeat: []
  setSpeed: [speed: number]
}>()

const speeds: SpeedOption[] = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

const decreaseSpeed = () => {
  const currentIndex = speeds.indexOf(props.playbackRate as SpeedOption)
  if (currentIndex > 0) {
    emit('setSpeed', speeds[currentIndex - 1])
  }
}

const increaseSpeed = () => {
  const currentIndex = speeds.indexOf(props.playbackRate as SpeedOption)
  if (currentIndex < speeds.length - 1) {
    emit('setSpeed', speeds[currentIndex + 1])
  }
}
</script>

<template>
  <div class="playback-controls">
    <div class="nav-controls">
      <button
        class="control-btn"
        :disabled="!canGoPrevious"
        @click="emit('previous')"
        title="Previous sentence (←)"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
        </svg>
      </button>

      <button
        class="control-btn play-btn"
        @click="emit('togglePlay')"
        :title="playing ? 'Pause (Space)' : 'Play (Space)'"
      >
        <svg v-if="playing" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>

      <button
        class="control-btn"
        :disabled="!canGoNext"
        @click="emit('next')"
        title="Next sentence (→)"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
        </svg>
      </button>

      <button
        class="control-btn"
        @click="emit('repeat')"
        title="Repeat sentence (R)"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
        </svg>
      </button>
    </div>

    <div class="speed-controls">
      <button
        class="control-btn small"
        @click="decreaseSpeed"
        :disabled="playbackRate <= 0.5"
        title="Decrease speed (-)"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M19 13H5v-2h14v2z"/>
        </svg>
      </button>

      <span class="speed-display">{{ playbackRate }}x</span>

      <button
        class="control-btn small"
        @click="increaseSpeed"
        :disabled="playbackRate >= 2"
        title="Increase speed (+)"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.playback-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.speed-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.15s;
}

.control-btn:hover:not(:disabled) {
  background: var(--hover-bg);
}

.control-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.control-btn.play-btn {
  width: 44px;
  height: 44px;
  background: var(--accent-color);
  color: white;
}

.control-btn.play-btn:hover {
  background: var(--accent-hover);
}

.control-btn.small {
  width: 28px;
  height: 28px;
}

.speed-display {
  min-width: 40px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color);
}
</style>
