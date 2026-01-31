<script setup lang="ts">
import type { TranscriptSegment } from '@/types'

const props = defineProps<{
  segment: TranscriptSegment
  index: number
  active: boolean
  bookmarked: boolean
}>()

const emit = defineEmits<{
  click: [index: number]
  bookmark: [index: number]
  loop: [segment: TranscriptSegment]
}>()

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div
    class="sentence-item"
    :class="{ active, bookmarked }"
    @click="emit('click', index)"
  >
    <span class="timestamp">{{ formatTime(segment.start) }}</span>
    <span class="text">{{ segment.text }}</span>
    <div class="actions">
      <button
        class="action-btn bookmark-btn"
        :class="{ active: bookmarked }"
        @click.stop="emit('bookmark', index)"
        title="Bookmark"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path v-if="bookmarked" d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
          <path v-else d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>
        </svg>
      </button>
      <button
        class="action-btn loop-btn"
        @click.stop="emit('loop', segment)"
        title="Loop this sentence"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sentence-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.sentence-item:hover {
  background: var(--hover-bg);
}

.sentence-item.active {
  background: var(--active-bg);
}

.sentence-item.active .text {
  color: var(--active-text);
  font-weight: 500;
}

.timestamp {
  flex-shrink: 0;
  font-size: 11px;
  font-family: monospace;
  color: var(--muted-text);
  padding-top: 2px;
}

.text {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color);
}

.actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s;
}

.sentence-item:hover .actions,
.sentence-item.active .actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--muted-text);
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  background: var(--hover-bg);
  color: var(--text-color);
}

.bookmark-btn.active {
  color: var(--accent-color);
}
</style>
