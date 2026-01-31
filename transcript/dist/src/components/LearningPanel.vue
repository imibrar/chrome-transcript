<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { TranscriptSegment, SpeedOption } from '@/types'
import { useYouTubePlayer } from '@/composables/useYouTubePlayer'
import { useTranscript } from '@/composables/useTranscript'
import { useABLoop } from '@/composables/useABLoop'
import { useBookmarks } from '@/composables/useBookmarks'
import { useSettings } from '@/composables/useSettings'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import PlaybackControls from './PlaybackControls.vue'
import ABLoopControls from './ABLoopControls.vue'
import TranscriptView from './TranscriptView.vue'
import SettingsPanel from './SettingsPanel.vue'

const props = defineProps<{
  videoId: string
}>()

type TabId = 'transcript' | 'bookmarks' | 'settings'
const activeTab = ref<TabId>('transcript')

const {
  playing,
  currentTime,
  playbackRate,
  attached,
  attach,
  togglePlay,
  seekTo,
  setPlaybackRate
} = useYouTubePlayer()

const {
  segments,
  loading,
  error,
  hasTranscript,
  load: loadTranscript,
  findSegmentAtTime,
  getSegment
} = useTranscript()

const {
  pointA,
  pointB,
  active: loopActive,
  setPointA,
  setPointB,
  clearLoop,
  toggleLoop,
  setLoopFromSegment
} = useABLoop(currentTime, seekTo)

const {
  hasBookmark,
  toggleBookmark,
  getVideoBookmarks
} = useBookmarks()

const { settings, updateSetting } = useSettings()

const collapsed = ref(false)

const currentSegmentIndex = computed(() => {
  if (!hasTranscript.value) return -1
  return findSegmentAtTime(currentTime.value)
})

const canGoPrevious = computed(() => currentSegmentIndex.value > 0)
const canGoNext = computed(() =>
  hasTranscript.value && currentSegmentIndex.value < segments.value.length - 1
)

const videoBookmarks = computed(() => getVideoBookmarks(props.videoId))

const speeds: SpeedOption[] = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

const previousSentence = () => {
  if (canGoPrevious.value) {
    const segment = getSegment(currentSegmentIndex.value - 1)
    if (segment) seekTo(segment.start)
  }
}

const nextSentence = () => {
  if (canGoNext.value) {
    const segment = getSegment(currentSegmentIndex.value + 1)
    if (segment) seekTo(segment.start)
  }
}

const repeatSentence = () => {
  const segment = getSegment(currentSegmentIndex.value)
  if (segment) seekTo(segment.start)
}

const decreaseSpeed = () => {
  const currentIndex = speeds.indexOf(playbackRate.value as SpeedOption)
  if (currentIndex > 0) {
    setPlaybackRate(speeds[currentIndex - 1])
  }
}

const increaseSpeed = () => {
  const currentIndex = speeds.indexOf(playbackRate.value as SpeedOption)
  if (currentIndex < speeds.length - 1) {
    setPlaybackRate(speeds[currentIndex + 1])
  }
}

const handleSeek = (time: number) => {
  seekTo(time)
}

const handleBookmark = (index: number) => {
  const segment = getSegment(index)
  if (segment) {
    toggleBookmark(props.videoId, index, segment)
  }
}

const handleLoop = (segment: TranscriptSegment) => {
  setLoopFromSegment(segment.start, segment.end)
}

const handleBookmarkClick = (bookmark: { timestamp: number }) => {
  seekTo(bookmark.timestamp)
  activeTab.value = 'transcript'
}

// Setup keyboard shortcuts
useKeyboardShortcuts({
  togglePlay,
  previousSentence,
  nextSentence,
  repeatSentence,
  decreaseSpeed,
  increaseSpeed,
  setPointA,
  setPointB,
  toggleLoop,
  clearLoop
})

// Initialize
onMounted(async () => {
  // Try to attach to player with retries
  let attempts = 0
  const tryAttach = () => {
    if (attach()) return true
    if (attempts++ < 10) {
      setTimeout(tryAttach, 500)
    }
    return false
  }
  tryAttach()

  // Load transcript
  await loadTranscript(props.videoId)
})

// Watch for video changes
watch(() => props.videoId, async (newId) => {
  if (newId) {
    clearLoop()
    await loadTranscript(newId)
  }
})
</script>

<template>
  <div class="learning-panel" :class="{ collapsed }">
    <div class="panel-header" @click="collapsed = !collapsed">
      <h3 class="panel-title">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9 10h2v7H9v-7zm4 0h2v7h-2v-7zm-8 0h2v7H5v-7z"/>
        </svg>
        English Practice
      </h3>
      <button class="collapse-btn" :title="collapsed ? 'Expand' : 'Collapse'">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="currentColor"
          :style="{ transform: collapsed ? 'rotate(180deg)' : 'none' }"
        >
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </button>
    </div>

    <template v-if="!collapsed">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading transcript...</span>
      </div>

      <div v-else-if="error" class="error-state">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>{{ error }}</span>
      </div>

      <template v-else-if="hasTranscript">
        <PlaybackControls
          :playing="playing"
          :playback-rate="playbackRate"
          :can-go-previous="canGoPrevious"
          :can-go-next="canGoNext"
          @toggle-play="togglePlay"
          @previous="previousSentence"
          @next="nextSentence"
          @repeat="repeatSentence"
          @set-speed="setPlaybackRate"
        />

        <ABLoopControls
          :point-a="pointA"
          :point-b="pointB"
          :active="loopActive"
          :current-time="currentTime"
          @set-a="setPointA"
          @set-b="setPointB"
          @toggle="toggleLoop"
          @clear="clearLoop"
        />

        <div class="tabs">
          <button
            class="tab"
            :class="{ active: activeTab === 'transcript' }"
            @click="activeTab = 'transcript'"
          >
            Transcript
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'bookmarks' }"
            @click="activeTab = 'bookmarks'"
          >
            Bookmarks ({{ videoBookmarks.length }})
          </button>
          <button
            class="tab"
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >
            Settings
          </button>
        </div>

        <div class="tab-content">
          <TranscriptView
            v-if="activeTab === 'transcript'"
            :segments="segments"
            :current-index="currentSegmentIndex"
            :auto-scroll="settings.autoScroll"
            :video-id="videoId"
            :has-bookmark="hasBookmark"
            @seek="handleSeek"
            @bookmark="handleBookmark"
            @loop="handleLoop"
          />

          <div v-else-if="activeTab === 'bookmarks'" class="bookmarks-view">
            <div v-if="videoBookmarks.length === 0" class="empty-state">
              No bookmarks yet
            </div>
            <div
              v-for="bookmark in videoBookmarks"
              :key="bookmark.segmentIndex"
              class="bookmark-item"
              @click="handleBookmarkClick(bookmark)"
            >
              <span class="bookmark-time">{{ Math.floor(bookmark.timestamp / 60) }}:{{ String(Math.floor(bookmark.timestamp % 60)).padStart(2, '0') }}</span>
              <span class="bookmark-text">{{ bookmark.text }}</span>
            </div>
          </div>

          <SettingsPanel
            v-else-if="activeTab === 'settings'"
            :settings="settings"
            @update="updateSetting"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<style scoped>
.learning-panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  max-height: 600px;
}

.learning-panel.collapsed {
  max-height: none;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--header-bg);
  cursor: pointer;
  user-select: none;
}

.panel-header:hover {
  background: var(--header-hover);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.15s;
}

.collapse-btn:hover {
  background: var(--hover-bg);
}

.collapse-btn svg {
  transition: transform 0.2s;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  color: var(--muted-text);
  font-size: 14px;
}

.error-state {
  color: var(--error-color);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.tab {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--muted-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.tab:hover {
  color: var(--text-color);
  background: var(--hover-bg);
}

.tab.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

.tab-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bookmarks-view {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.bookmark-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.bookmark-item:hover {
  background: var(--hover-bg);
}

.bookmark-time {
  flex-shrink: 0;
  font-size: 11px;
  font-family: monospace;
  color: var(--accent-color);
  padding-top: 2px;
}

.bookmark-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-color);
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
