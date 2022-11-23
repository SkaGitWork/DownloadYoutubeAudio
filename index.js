var express = require("express")
var fs = require("fs")
var app = express()
var ytdl = require("ytdl-core")
var cors = require("cors")
var path = require("path")
// var getVideoDuration = require("./getVideoDuration.js")
var ffmpeg = require("fluent-ffmpeg")

// If production use absolute path
const ffmpegPath =
  app.get("env") === "development" ? "ffmpeg\\bin\\ffmpeg.exe" : "ffmpeg"
const uploadsDir = "Audio"
const port = process.env.PORT || 4000

app.use(cors())
app.listen(port)
// We make the folder audio accessible
app.use("/Audio", express.static(uploadsDir))

app.get("/", function () {
  console.log("Hello")
})

// Create folder 'Audio'
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
}

// Delete the content of 'Audio' folder after 5 hour
setInterval(function () {
  fs.readdir(uploadsDir, function (err, files) {
    files.forEach(function (file, index) {
      fs.stat(path.join(uploadsDir, file), function (err, stat) {
        var endTime, now
        if (err) {
          return console.error(err)
        }
        now = new Date().getTime()
        endTime = new Date(stat.ctime).getTime() + 3600000
        if (now > endTime) {
          return rimraf(path.join(uploadsDir, file), function (err) {
            if (err) {
              return console.error(err)
            }
            console.log("successfully deleted")
          })
        }
      })
    })
  })
}, 18000000) // every 5 hours

app.get("/stream/:id", async (req, res) => {
  const videoId = req.params.id
  const url = "https://www.youtube.com/watch?v=" + videoId
  const path = `Audio/${videoId}.mp3`

  // If audio exist in 'Audio'
  try {
    if (fs.existsSync(path)) {
      return res.send("Done")
    }

    console.log("New video to convert, ID=", videoId)
    // Get video duration
    // if ((await getVideoDuration(videoId)) > 1200)
    //   return res.status(500).send("Video too long (over 20min)")

    ffmpegMp3Conversion()
    res.send("Done")
  } catch (error) {
    console.log(error)
  }

  function ffmpegMp3Conversion() {
    // We start the data acquisition (only audio)
    stream = ytdl(url, { filter: "audioonly" })

    // Convert to MP3
    proc = new ffmpeg({ source: stream })
    // Set ffmpeg path, we have to download ffmpeg from their site and put it in our project (development mode only)
    proc.setFfmpegPath(ffmpegPath)
    // Save in 'Audio' folder
    proc.saveToFile(path)
    proc.on("end", () => {
      console.log("Upload completed")
    })
  }
})
