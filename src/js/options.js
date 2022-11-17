var outputLocationInput = document.getElementById("outputLocation")
var downloadedVideoListElement = document.getElementById("savedIds")
var importInput = document.getElementById("importInput")
var importButton = document.getElementById("importButton")
var filesTitle = []

// Import titles
importInput.onchange = (e) => {
  for (const file of e.target.files) {
    filesTitle.push(file.name.replace(".mp3", "").trim())
  }
}

// On import Click
importButton.onclick = () => {
  chrome.storage.local.get(["downloadedVideos"], (result) => {
    let downloadedVideos = result.downloadedVideos

    filesTitle.forEach((title) => {
      if (!downloadedVideos.find((video) => video.title === title))
        downloadedVideos.push({ id: "Imported", title: title })
    })

    chrome.storage.local.set({
      downloadedVideos: downloadedVideos,
    })

    initStorageDownloadedVideos(result)
  })
}

// Init storage
chrome.storage.local.get((result) => {
  initStorageDownloadedVideos(result)
  if (!result.outputLocation) {
    outputLocationInput.value = "YouTube MP3 Downloader/"
    chrome.storage.local.set({
      outputLocation: "YouTube MP3 Downloader/",
    })
  } else {
    outputLocationInput.value = result.outputLocation
  }
})

// Output location HTML input
var timer
outputLocation.oninput = (e) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    let value = e.target.value
    if (value[0] === "/") outputLocationInput.value = value = value.slice(1)

    if (value !== "" && value.slice(-1) !== "/") {
      outputLocationInput.value = value += "/"
    }
    chrome.storage.local.set({ outputLocation: value })
  }, 1000)
}

// Clear storage
$("#clearStorage").click(() => {
  chrome.storage.local.set({
    downloadedVideos: [],
  })
  downloadedVideoListElement.innerHTML = "No video downloaded"
})

function initStorageDownloadedVideos(result) {
  let downloadedVideos = result?.downloadedVideos
  if (!downloadedVideos)
    chrome.storage.local.set({
      downloadedVideos: [],
    })
  else {

    if (!downloadedVideos.length)
      downloadedVideoListElement.innerHTML = "No video downloaded"
    else
      downloadedVideos.forEach((video) => {
        let p = document.createElement("p")
        p.innerHTML = video.title+ ", " + video.id 
        downloadedVideoListElement.appendChild(p)
      })
  }
}
