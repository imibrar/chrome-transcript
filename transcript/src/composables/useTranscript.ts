import { ref, computed, readonly } from 'vue'
import type { TranscriptSegment } from '@/types'
import { TranscriptExtractor } from '@/content/transcript-extractor'

const extractor = new TranscriptExtractor()

export function useTranscript() {
  const segments = ref<TranscriptSegment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const videoId = ref<string | null>(null)

  const hasTranscript = computed(() => segments.value.length > 0)

  const load = async (newVideoId: string): Promise<boolean> => {
    if (newVideoId === videoId.value && hasTranscript.value) {
      return true
    }

    loading.value = true
    error.value = null
    segments.value = []
    videoId.value = newVideoId

    try {
      segments.value = await extractor.extract(newVideoId)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load transcript'
      return false
    } finally {
      loading.value = false
    }
  }

  const clear = () => {
    segments.value = []
    videoId.value = null
    error.value = null
  }

  const findSegmentAtTime = (time: number): number => {
    for (let i = 0; i < segments.value.length; i++) {
      const segment = segments.value[i]
      if (time >= segment.start && time < segment.end) {
        return i
      }
    }
    // If past all segments, return last one
    if (segments.value.length > 0 && time >= segments.value[segments.value.length - 1].end) {
      return segments.value.length - 1
    }
    return -1
  }

  const getSegment = (index: number): TranscriptSegment | null => {
    return segments.value[index] ?? null
  }

  const getPreviousSegment = (currentIndex: number): TranscriptSegment | null => {
    if (currentIndex > 0) {
      return segments.value[currentIndex - 1]
    }
    return null
  }

  const getNextSegment = (currentIndex: number): TranscriptSegment | null => {
    if (currentIndex < segments.value.length - 1) {
      return segments.value[currentIndex + 1]
    }
    return null
  }

  return {
    // State
    segments: readonly(segments),
    loading: readonly(loading),
    error: readonly(error),
    videoId: readonly(videoId),
    hasTranscript,

    // Methods
    load,
    clear,
    findSegmentAtTime,
    getSegment,
    getPreviousSegment,
    getNextSegment
  }
}
