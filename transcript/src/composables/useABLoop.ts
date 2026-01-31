import { ref, computed, watch, readonly } from 'vue'
import type { Ref } from 'vue'

export function useABLoop(
  currentTime: Ref<number>,
  seekTo: (time: number) => void
) {
  const pointA = ref<number | null>(null)
  const pointB = ref<number | null>(null)
  const active = ref(false)

  const hasLoop = computed(() => pointA.value !== null && pointB.value !== null)

  const setPointA = (time?: number) => {
    pointA.value = time ?? currentTime.value
    // If B is set and A is now after B, swap them
    if (pointB.value !== null && pointA.value > pointB.value) {
      const temp = pointA.value
      pointA.value = pointB.value
      pointB.value = temp
    }
  }

  const setPointB = (time?: number) => {
    pointB.value = time ?? currentTime.value
    // If A is set and B is now before A, swap them
    if (pointA.value !== null && pointB.value < pointA.value) {
      const temp = pointA.value
      pointA.value = pointB.value
      pointB.value = temp
    }
    // Auto-activate when both points are set
    if (pointA.value !== null) {
      active.value = true
    }
  }

  const clearLoop = () => {
    pointA.value = null
    pointB.value = null
    active.value = false
  }

  const toggleLoop = () => {
    if (hasLoop.value) {
      active.value = !active.value
    }
  }

  const setLoopFromSegment = (start: number, end: number) => {
    pointA.value = start
    pointB.value = end
    active.value = true
    seekTo(start)
  }

  // Watch for when playback reaches point B
  watch(currentTime, (time) => {
    if (active.value && pointA.value !== null && pointB.value !== null) {
      if (time >= pointB.value) {
        seekTo(pointA.value)
      }
    }
  })

  return {
    // State
    pointA: readonly(pointA),
    pointB: readonly(pointB),
    active: readonly(active),
    hasLoop,

    // Methods
    setPointA,
    setPointB,
    clearLoop,
    toggleLoop,
    setLoopFromSegment
  }
}
