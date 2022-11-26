// import serverURL from "./serverURL.js"
// const serverURL = require("./serverURL.js")

// const url = "http://localhost:4000"
const url = serverURL
var youTubePlayer, youTubeLeftControls, downloadAudioMP3Btn, downloadStatus

function displayButton() {
  const downloadAudioMP3BtnExist = $(".download-btn")[0]

  // If the button is not loaded
  if (!downloadAudioMP3BtnExist) {
    console.log("Displaying new button")
    // Get YouTube video element
    youTubePlayer = document.getElementsByClassName("video-stream")[0]
    // Get YouTube controls element
    youTubeLeftControls = $(".ytp-left-controls")
    // We create an element where we display the status
    downloadStatus = $("<span></span>")
    downloadStatus.css("cursor", "pointer")

    // The donwload button will be an image
    downloadAudioMP3Btn = $("<img>", {
      class: "download-btn",
      // We get the image with 'chrome.runtime.getURL(pathName)'
      src: chrome.runtime.getURL("assets/downloadLogo.png"),
      style: "height : 30px;align-self : center;margin-right : 10px;",
      title: "Download MP3",
    })

    // We add these element in the YouTube controller
    youTubeLeftControls.append(downloadAudioMP3Btn)
    youTubeLeftControls.append(downloadStatus)
  }

  downloadVideo()
}

// Display button when page is loaded
displayButton()

// Listen to messages...
chrome.runtime.onMessage.addListener((message) => {
  // When new video is triggered
  if (message.type === "NEW") {
    // Call displayButton
    displayButton()
  }
})

async function downloadVideo() {
  // If video > 20 minutes then stop download
  if (youTubePlayer.duration > 1200) return downloadStatus.html("Too long")

  downloadStatus.html("Convert to MP3")

  // Get video id
  const queryParameters = window.location.href.split("?")[1]
  const urlParameters = new URLSearchParams(queryParameters)
  const videoId = urlParameters.get("v")

  // Check if already downloaded
  let { downloadedVideos } = await chrome.storage.local.get([
    "downloadedVideos",
  ])

  // If true then make the text red
  if (
    downloadedVideos.find(
      (video) =>
        video.id === videoId ||
        video.title === document.title.replace(" - YouTube", "")
    )
  ) {
    downloadStatus.css("color", "red")
  }

  downloadAudioMP3Btn.click(async () => {
    downloadStatus.html("Converting...")
    // Request a MP3 conversion
    await fetch(url + "/stream/" + videoId)

    // Get the audio from the server storage
    fetch(url + `/Audio/${videoId}.mp3`)
      // Convert it to blob for intant download
      .then((response) => response.blob())
      .then((blob) => {
        const blobURL = URL.createObjectURL(blob)

        downloadStatus.html("Downloaded")

        // Send message to background
        chrome.runtime.sendMessage({
          type: "DOWNLOAD_REQUEST",
          videoId: videoId,
          url: blobURL,
          filename: document.title.replace(" - YouTube", ""),
        })
      })
      .catch((err) => {
        downloadAudioMP3Btn.innerHTML = "Retry later"
      })
  })
}
