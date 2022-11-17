// Trigger when new tab or tab update
chrome.tabs.onUpdated.addListener((tabId, tab) => {
  // Check if it's a YouTube video
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    // Send message to our extension running in the tab Id = TabId 
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
    })
  }
})

// On download click
chrome.runtime.onMessage.addListener(function (message) {
  var { url, filename, videoId, type } = message
  if (type !== "DOWNLOAD_REQUEST") return

  // Chrome download
  chrome.storage.local.get(["outputLocation"], async (result) => {
    let outputLocation = result.outputLocation
    // Remove invalid characters
    let invalidCharacters = [":", '"',"/", "?", "~", "<", ">", "*", "|"]
    invalidCharacters.forEach((char) => {
      filename = filename.replaceAll(char, "")
    })

    // Download Api
    await chrome.downloads.download({
      filename: outputLocation + filename + ".mp3",
      conflictAction: "overwrite",
      url: url,
    })

    // Save in local storage
    chrome.storage.local.get(["downloadedVideos"], (result) => {
      let downloadedVideos = result.downloadedVideos
      if (downloadedVideos.find((video) => video.id === videoId)) return
      chrome.storage.local.set({
        downloadedVideos: [
          {
            id: videoId,
            title: filename,
          },
          ...downloadedVideos,
        ],
      })
    })
  })
})
