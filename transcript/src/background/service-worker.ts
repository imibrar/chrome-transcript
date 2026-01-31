// Service worker for YouTube English Practice extension

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('YouTube English Practice extension installed')
  } else if (details.reason === 'update') {
    console.log('YouTube English Practice extension updated')
  }
})

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_VIDEO_INFO') {
    // Could be used for additional API calls in the future
    sendResponse({ success: true })
  }
  return true
})

export {}
