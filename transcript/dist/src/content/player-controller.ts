import type { PlayerState } from '@/types'

type PlayerEventCallback = (state: PlayerState) => void

export class PlayerController {
  private video: HTMLVideoElement | null = null
  private listeners: Map<string, EventListener> = new Map()
  private stateCallback: PlayerEventCallback | null = null

  attach(callback: PlayerEventCallback): boolean {
    this.stateCallback = callback
    this.video = document.querySelector('video.html5-main-video')

    if (!this.video) {
      return false
    }

    this.setupListeners()
    this.emitState()
    return true
  }

  detach(): void {
    if (this.video) {
      this.listeners.forEach((listener, event) => {
        this.video?.removeEventListener(event, listener)
      })
    }
    this.listeners.clear()
    this.video = null
    this.stateCallback = null
  }

  private setupListeners(): void {
    if (!this.video) return

    const events = ['timeupdate', 'play', 'pause', 'ratechange', 'durationchange']

    events.forEach(event => {
      const listener = () => this.emitState()
      this.listeners.set(event, listener)
      this.video?.addEventListener(event, listener)
    })
  }

  private emitState(): void {
    if (!this.video || !this.stateCallback) return

    this.stateCallback({
      playing: !this.video.paused,
      currentTime: this.video.currentTime,
      duration: this.video.duration || 0,
      playbackRate: this.video.playbackRate
    })
  }

  play(): void {
    this.video?.play()
  }

  pause(): void {
    this.video?.pause()
  }

  togglePlay(): void {
    if (!this.video) return
    if (this.video.paused) {
      this.video.play()
    } else {
      this.video.pause()
    }
  }

  seekTo(time: number): void {
    if (this.video) {
      this.video.currentTime = time
    }
  }

  setPlaybackRate(rate: number): void {
    if (this.video) {
      this.video.playbackRate = rate
    }
  }

  getCurrentTime(): number {
    return this.video?.currentTime || 0
  }

  getDuration(): number {
    return this.video?.duration || 0
  }

  getPlaybackRate(): number {
    return this.video?.playbackRate || 1
  }

  isPlaying(): boolean {
    return this.video ? !this.video.paused : false
  }

  isAttached(): boolean {
    return this.video !== null
  }
}
