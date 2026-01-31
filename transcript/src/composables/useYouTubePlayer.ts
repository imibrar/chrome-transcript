import { ref, readonly, onUnmounted } from 'vue'
import type { PlayerState } from '@/types'
import { PlayerController } from '@/content/player-controller'

const controller = new PlayerController()

export function useYouTubePlayer() {
  const playing = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const playbackRate = ref(1)
  const attached = ref(false)

  const handleStateUpdate = (state: PlayerState) => {
    playing.value = state.playing
    currentTime.value = state.currentTime
    duration.value = state.duration
    playbackRate.value = state.playbackRate
  }

  const attach = () => {
    attached.value = controller.attach(handleStateUpdate)
    return attached.value
  }

  const detach = () => {
    controller.detach()
    attached.value = false
  }

  const play = () => controller.play()
  const pause = () => controller.pause()
  const togglePlay = () => controller.togglePlay()
  const seekTo = (time: number) => controller.seekTo(time)
  const setPlaybackRate = (rate: number) => controller.setPlaybackRate(rate)

  onUnmounted(() => {
    detach()
  })

  return {
    // State
    playing: readonly(playing),
    currentTime: readonly(currentTime),
    duration: readonly(duration),
    playbackRate: readonly(playbackRate),
    attached: readonly(attached),

    // Methods
    attach,
    detach,
    play,
    pause,
    togglePlay,
    seekTo,
    setPlaybackRate
  }
}
