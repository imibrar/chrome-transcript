<script setup lang="ts">
const props = defineProps<{
  pointA: number | null
  pointB: number | null
  active: boolean
  currentTime: number
}>()

const emit = defineEmits<{
  setA: []
  setB: []
  toggle: []
  clear: []
}>()

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="ab-loop-controls">
    <div class="loop-buttons">
      <button
        class="loop-btn"
        :class="{ set: pointA !== null }"
        @click="emit('setA')"
        title="Set loop start (A)"
      >
        <span class="label">A</span>
        <span v-if="pointA !== null" class="time">{{ formatTime(pointA) }}</span>
      </button>

      <button
        class="loop-btn"
        :class="{ set: pointB !== null }"
        @click="emit('setB')"
        title="Set loop end (B)"
      >
        <span class="label">B</span>
        <span v-if="pointB !== null" class="time">{{ formatTime(pointB) }}</span>
      </button>
    </div>

    <div class="loop-actions">
      <button
        v-if="pointA !== null && pointB !== null"
        class="action-btn"
        :class="{ active: active }"
        @click="emit('toggle')"
        title="Toggle loop (L)"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
        </svg>
        <span>{{ active ? 'On' : 'Off' }}</span>
      </button>

      <button
        v-if="pointA !== null || pointB !== null"
        class="action-btn clear"
        @click="emit('clear')"
        title="Clear loop (Esc)"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.ab-loop-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--subtle-bg);
}

.loop-buttons {
  display: flex;
  gap: 8px;
}

.loop-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.loop-btn:hover {
  border-color: var(--accent-color);
}

.loop-btn.set {
  border-color: var(--accent-color);
  background: var(--accent-bg);
}

.loop-btn .label {
  font-weight: 600;
  color: var(--accent-color);
}

.loop-btn .time {
  font-family: monospace;
  font-size: 11px;
  color: var(--muted-text);
}

.loop-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--muted-text);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  background: var(--hover-bg);
  color: var(--text-color);
}

.action-btn.active {
  background: var(--accent-color);
  color: white;
}

.action-btn.clear:hover {
  background: var(--error-bg);
  color: var(--error-color);
}
</style>
