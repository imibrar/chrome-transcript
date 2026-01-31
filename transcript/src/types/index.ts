export interface TranscriptSegment {
  text: string
  start: number
  duration: number
  end: number
}

export interface ABLoop {
  pointA: number | null
  pointB: number | null
  active: boolean
}

export interface Bookmark {
  videoId: string
  segmentIndex: number
  text: string
  timestamp: number
  createdAt: number
}

export interface UserSettings {
  autoScroll: boolean
  playbackSpeed: number
  panelCollapsed: boolean
  theme: 'auto' | 'light' | 'dark'
}

export interface PlayerState {
  playing: boolean
  currentTime: number
  duration: number
  playbackRate: number
}

export type SpeedOption = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2
