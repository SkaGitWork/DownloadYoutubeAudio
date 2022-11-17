const request = require("request-promise")
var cheerio = require("cheerio")

module.exports = async function getVideoInfo(videoId) {

  const body = await fetchVideoPage(videoId)

  return parseVideoInfo(body)
}


function fetchVideoPage(videoId) {
  var cookieJar = request.jar()

  return request({
    url: 'https://www.youtube.com/watch?v=' + videoId,
    jar: cookieJar,
    headers: {
      Host: 'www.youtube.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      Connection: 'keep-alive',
      'Cache-Control': 'max-age=0'
    }
  })
}

function parseVideoInfo(body) {
  var $ = cheerio.load(body)

  var duration = extractValue(
    $('.watch-main-col meta[itemprop="duration"]'),
    "content"
  )
  duration = duration ? parseDuration(duration) : undefined

  return duration
}

function extractValue($, attribute) {
  if ($ && $.length) {
    return $.attr(attribute) || undefined
  }
  return undefined
}

function parseDuration(raw) {
  var m = /^[a-z]*(?:(\d+)M)?(\d+)S$/i.exec(raw)
  if (!m) return

  var minutes = m[1] ? parseInt(m[1], 10) : 0
  var seconds = m[2] ? parseInt(m[2], 10) : 0
  return minutes * 60 + seconds
}

