<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { TranscriptSegment } from '@/types'
import SentenceItem from './SentenceItem.vue'

const props = defineProps<{
  segments: TranscriptSegment[]
  currentIndex: number
  autoScroll: boolean
  videoId: string | null
  hasBookmark: (videoId: string, index: number) => boolean
}>()

const emit = defineEmits<{
  seek: [time: number]
  bookmark: [index: number]
  loop: [segment: TranscriptSegment]
}>()

const containerRef = ref<HTMLElement | null>(null)

const handleClick = (index: number) => {
  const segment = props.segments[index]
  if (segment) {
    emit('seek', segment.start)
  }
}

const handleBookmark = (index: number) => {
  emit('bookmark', index)
}

const handleLoop = (segment: TranscriptSegment) => {
  emit('loop', segment)
}

// Auto-scroll to active sentence
watch(
  () => props.currentIndex,
  async (index) => {
    if (!props.autoScroll || index < 0) return

    await nextTick()

    const container = containerRef.value
    if (!container) return

    const activeElement = container.querySelector('.sentence-item.active')
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }
)
</script>

<template>
  <div ref="containerRef" class="transcript-view">
    <div v-if="segments.length === 0" class="empty-state">
      No transcript available
    </div>
    <template v-else>
      <SentenceItem
        v-for="(segment, index) in segments"
        :key="index"
        :segment="segment"
        :index="index"
        :active="index === currentIndex"
        :bookmarked="videoId ? hasBookmark(videoId, index) : false"
        @click="handleClick"
        @bookmark="handleBookmark"
        @loop="handleLoop"
      />
    </template>
  </div>
</template>

<style scoped>
.transcript-view {
  flex: 1;
  overflow-y: auto;
  padding: 8px 4px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: var(--muted-text);
  font-size: 14px;
}
</style>
