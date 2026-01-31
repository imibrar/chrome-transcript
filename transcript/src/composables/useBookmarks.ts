import { ref, readonly, onMounted } from 'vue'
import type { Bookmark, TranscriptSegment } from '@/types'

const STORAGE_KEY = 'yt-english-practice-bookmarks'

export function useBookmarks() {
  const bookmarks = ref<Bookmark[]>([])

  const loadBookmarks = async () => {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY)
      bookmarks.value = result[STORAGE_KEY] || []
    } catch {
      bookmarks.value = []
    }
  }

  const saveBookmarks = async () => {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: bookmarks.value })
    } catch (e) {
      console.error('Failed to save bookmarks:', e)
    }
  }

  const addBookmark = async (
    videoId: string,
    segmentIndex: number,
    segment: TranscriptSegment
  ) => {
    // Check if already bookmarked
    const exists = bookmarks.value.some(
      b => b.videoId === videoId && b.segmentIndex === segmentIndex
    )

    if (!exists) {
      bookmarks.value.push({
        videoId,
        segmentIndex,
        text: segment.text,
        timestamp: segment.start,
        createdAt: Date.now()
      })
      await saveBookmarks()
    }
  }

  const removeBookmark = async (videoId: string, segmentIndex: number) => {
    const index = bookmarks.value.findIndex(
      b => b.videoId === videoId && b.segmentIndex === segmentIndex
    )

    if (index !== -1) {
      bookmarks.value.splice(index, 1)
      await saveBookmarks()
    }
  }

  const toggleBookmark = async (
    videoId: string,
    segmentIndex: number,
    segment: TranscriptSegment
  ) => {
    const isBookmarked = hasBookmark(videoId, segmentIndex)

    if (isBookmarked) {
      await removeBookmark(videoId, segmentIndex)
    } else {
      await addBookmark(videoId, segmentIndex, segment)
    }
  }

  const hasBookmark = (videoId: string, segmentIndex: number): boolean => {
    return bookmarks.value.some(
      b => b.videoId === videoId && b.segmentIndex === segmentIndex
    )
  }

  const getVideoBookmarks = (videoId: string): Bookmark[] => {
    return bookmarks.value.filter(b => b.videoId === videoId)
  }

  onMounted(() => {
    loadBookmarks()
  })

  return {
    // State
    bookmarks: readonly(bookmarks),

    // Methods
    loadBookmarks,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    hasBookmark,
    getVideoBookmarks
  }
}
