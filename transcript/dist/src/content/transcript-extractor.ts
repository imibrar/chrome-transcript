import type { TranscriptSegment } from '@/types'

interface CaptionTrack {
  baseUrl: string
  name: { simpleText: string }
  languageCode: string
  kind?: string
}

interface PlayerResponse {
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: CaptionTrack[]
    }
  }
}

export class TranscriptExtractor {
  async extract(videoId: string): Promise<TranscriptSegment[]> {
    const playerResponse = await this.getPlayerResponse()

    if (!playerResponse) {
      throw new Error('Could not find player response')
    }

    const captionTrack = this.findBestCaptionTrack(playerResponse)

    if (!captionTrack) {
      throw new Error('No captions available for this video')
    }

    const xml = await this.fetchTranscriptXml(captionTrack.baseUrl)
    return this.parseTranscriptXml(xml)
  }

  private async getPlayerResponse(): Promise<PlayerResponse | null> {
    // Try to find ytInitialPlayerResponse in the page
    const scripts = document.querySelectorAll('script')

    for (const script of scripts) {
      const content = script.textContent
      if (!content) continue

      // Match ytInitialPlayerResponse
      const match = content.match(/ytInitialPlayerResponse\s*=\s*({.+?});/)
      if (match) {
        try {
          return JSON.parse(match[1])
        } catch {
          continue
        }
      }
    }

    // Fallback: try to get from window object via injection
    return this.getPlayerResponseFromWindow()
  }

  private getPlayerResponseFromWindow(): Promise<PlayerResponse | null> {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      const callbackName = `__ytTranscript_${Date.now()}`

      ;(window as any)[callbackName] = (data: PlayerResponse | null) => {
        delete (window as any)[callbackName]
        script.remove()
        resolve(data)
      }

      script.textContent = `
        try {
          window['${callbackName}'](ytInitialPlayerResponse || null);
        } catch(e) {
          window['${callbackName}'](null);
        }
      `
      document.head.appendChild(script)

      // Timeout fallback
      setTimeout(() => {
        if ((window as any)[callbackName]) {
          delete (window as any)[callbackName]
          script.remove()
          resolve(null)
        }
      }, 1000)
    })
  }

  private findBestCaptionTrack(playerResponse: PlayerResponse): CaptionTrack | null {
    const tracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks

    if (!tracks || tracks.length === 0) {
      return null
    }

    // Priority: English manual > English auto > any manual > any auto
    const englishManual = tracks.find(
      t => t.languageCode.startsWith('en') && t.kind !== 'asr'
    )
    if (englishManual) return englishManual

    const englishAuto = tracks.find(
      t => t.languageCode.startsWith('en') && t.kind === 'asr'
    )
    if (englishAuto) return englishAuto

    const anyManual = tracks.find(t => t.kind !== 'asr')
    if (anyManual) return anyManual

    return tracks[0]
  }

  private async fetchTranscriptXml(baseUrl: string): Promise<string> {
    // Add format parameter to ensure we get XML
    const url = new URL(baseUrl)
    url.searchParams.set('fmt', 'srv3')

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.status}`)
    }

    return response.text()
  }

  private parseTranscriptXml(xml: string): TranscriptSegment[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')
    const textElements = doc.querySelectorAll('text')

    const segments: TranscriptSegment[] = []

    textElements.forEach((element) => {
      const start = parseFloat(element.getAttribute('start') || '0')
      const duration = parseFloat(element.getAttribute('dur') || '0')
      const text = this.decodeHtmlEntities(element.textContent || '')
        .replace(/\n/g, ' ')
        .trim()

      if (text) {
        segments.push({
          text,
          start,
          duration,
          end: start + duration
        })
      }
    })

    return segments
  }

  private decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }
}
