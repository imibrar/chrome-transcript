# YouTube English Practice Chrome Extension - Implementation Plan

## Overview
Build a Chrome extension that helps users practice English speaking using YouTube transcripts. The extension injects a learning panel directly into YouTube pages (not a popup) with features for sentence navigation, A-B loops, speed control, and interactive transcript following.

## Project Location
`/mnt/d/sandbox/chrome-extentions/transcript/`

## Technology Stack
- **Build Tool**: Vite 5.x + CRXJS plugin (same pattern as reference extension)
- **Framework**: Vue 3.4+ with Composition API
- **Language**: TypeScript 5.x
- **State Management**: Pinia
- **Messaging**: webext-bridge (same as reference)
- **Manifest**: V3

## Project Structure
```
transcript/
├── public/
│   └── icons/               # Extension icons (16, 32, 48, 128px)
├── src/
│   ├── assets/styles/       # CSS with custom properties
│   ├── background/
│   │   └── service-worker.ts
│   ├── content/
│   │   ├── index.ts              # Entry point, Vue app bootstrap
│   │   ├── youtube-observer.ts   # URL change detection (MutationObserver)
│   │   ├── transcript-extractor.ts # Extract transcript from YouTube
│   │   ├── player-controller.ts  # Video player control wrapper
│   │   └── panel-injector.ts     # Inject panel into YouTube DOM
│   ├── components/
│   │   ├── LearningPanel.vue     # Main panel container
│   │   ├── TranscriptView.vue    # Scrollable transcript list
│   │   ├── SentenceItem.vue      # Individual sentence
│   │   ├── PlaybackControls.vue  # Speed, play/pause, nav
│   │   ├── ABLoopControls.vue    # A-B loop markers
│   │   └── SettingsPanel.vue     # User preferences
│   ├── composables/
│   │   ├── useYouTubePlayer.ts   # Player control logic
│   │   ├── useTranscript.ts      # Transcript state
│   │   ├── useABLoop.ts          # A-B loop logic
│   │   └── useKeyboardShortcuts.ts
│   └── types/                    # TypeScript interfaces
├── manifest.json
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## User Preferences
- **Panel Position**: Right sidebar (in #secondary, pushing related videos down)
- **Dictionary**: No - keeping it simple, focused on listening/speaking practice
- **Extra Features**: Sentence bookmarks only (no progress tracking or shadow mode)

## Core Features

### 1. Transcript Extraction
- Extract from `ytInitialPlayerResponse` in page scripts
- Parse caption track URL and fetch XML
- Convert to `{text, start, duration, end}[]` segments
- Prefer English manual captions, fallback to auto-generated

### 2. Panel Injection
- Inject into `#secondary` (where related videos appear)
- Use Shadow DOM for style isolation
- Panel persists during YouTube SPA navigation
- Collapsible design to save space

### 3. Playback Controls
- Play/Pause toggle
- Previous/Next sentence navigation
- Repeat current sentence
- Speed control: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x

### 4. A-B Loop
- Set point A (start of loop)
- Set point B (end of loop)
- Auto-loop back to A when reaching B
- Clear/toggle loop

### 5. Interactive Transcript
- Scrollable list showing all sentences
- Highlight current sentence based on playback time
- Click sentence to jump to that timestamp
- Auto-scroll to follow playback (toggleable)

### 6. Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Space | Play/Pause |
| ← | Previous sentence |
| → | Next sentence |
| R | Repeat current sentence |
| - | Decrease speed |
| + | Increase speed |
| A | Set loop point A |
| B | Set loop point B |
| L | Toggle loop |
| Esc | Clear loop |

## Implementation Steps

### Phase 1: Project Setup
1. Create project directory structure
2. Initialize npm project with dependencies:
   - vue, pinia, webext-bridge
   - @crxjs/vite-plugin, @vitejs/plugin-vue, typescript, vite
3. Configure vite.config.ts for Chrome extension
4. Configure tsconfig.json
5. Create manifest.json (Manifest V3)
6. Create extension icons

### Phase 2: Content Script Foundation
1. Create YouTube observer with MutationObserver for URL changes
2. Create panel injector to insert div into YouTube's #secondary
3. Create content script entry that:
   - Detects video pages
   - Mounts Vue app into injected container
   - Handles cleanup on navigation

### Phase 3: Transcript Extraction
1. Create transcript extractor that:
   - Finds ytInitialPlayerResponse in page
   - Extracts caption track URL
   - Fetches and parses XML
   - Returns structured segments
2. Create useTranscript composable for state management

### Phase 4: Player Integration
1. Create player controller wrapper for HTMLVideoElement
2. Implement: play, pause, seekTo, setPlaybackRate
3. Listen to: timeupdate, play, pause, ratechange
4. Create useYouTubePlayer composable

### Phase 5: UI Components
1. LearningPanel.vue - main container with tabs
2. PlaybackControls.vue - navigation and speed
3. ABLoopControls.vue - loop marker controls
4. TranscriptView.vue - scrollable transcript
5. SentenceItem.vue - individual sentence display
6. Style with CSS custom properties for consistency

### Phase 6: Advanced Features
1. Implement A-B loop logic with useABLoop composable
2. Add keyboard shortcuts with useKeyboardShortcuts
3. Add settings persistence with Chrome storage
4. Add sentence bookmarking (save to Chrome storage, bookmark icon on sentences)

### Phase 7: Polish
1. Add loading states and error handling
2. Add dark mode support (detect YouTube's theme)
3. Test across different video types
4. Optimize performance

## Key Implementation Details

### YouTube Observer Pattern
```typescript
// Intercept history methods for SPA navigation
history.pushState = (...args) => {
  originalPushState.apply(history, args);
  checkForVideo();
};
// Also observe title element changes
```

### Transcript Extraction
```typescript
// Find in page scripts
const match = script.textContent?.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
// Get caption URL from playerResponse.captions.playerCaptionsTracklistRenderer
// Fetch and parse XML transcript
```

### Panel Injection Point
```typescript
const secondary = document.querySelector('#secondary-inner') ||
                  document.querySelector('#secondary');
secondary.insertBefore(container, secondary.firstChild);
```

## Verification Plan
1. **Development**: Run `npm run dev`, load extension from `dist/` folder
2. **Test extraction**: Open any YouTube video, verify transcript loads
3. **Test navigation**: Click sentences, verify video jumps to timestamp
4. **Test playback**: Use speed controls, verify rate changes
5. **Test A-B loop**: Set points, verify loop behavior
6. **Test keyboard**: Verify all shortcuts work
7. **Test navigation**: Navigate between videos, verify panel updates
8. **Test persistence**: Change settings, reload, verify saved

## Files to Create (in order)
1. `package.json` - Dependencies
2. `tsconfig.json` - TypeScript config
3. `vite.config.ts` - Build config
4. `manifest.json` - Extension manifest
5. `src/content/youtube-observer.ts`
6. `src/content/panel-injector.ts`
7. `src/content/player-controller.ts`
8. `src/content/transcript-extractor.ts`
9. `src/composables/*.ts` - All composables
10. `src/components/*.vue` - All Vue components
11. `src/content/index.ts` - Entry point
12. `src/background/service-worker.ts`
13. `src/assets/styles/*.css` - Styles
14. `public/icons/*.png` - Icons
