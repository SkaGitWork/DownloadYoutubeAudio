$("#go-to-options").click(() => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage()
  } else {
    window.open(chrome.runtime.getURL("options.html"))
  }
})

chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
  let title = tab[0].title.replace(" - YouTube", "")

  chrome.storage.local.get(["downloadedVideos"], (result) => {
    let downloadedVideos = result.downloadedVideos
    let max = { score: 0, title: "" }
    downloadedVideos.forEach((video) => {
      if (similarityFn(title, video.title) > max.score)
        max = { score: similarityFn(title, video.title), title: video.title }
    })
    $("#similarityResult").html(
      `Title : ${max.title} <br> Score : ${max.score.toFixed(2)}`
    )
    console.log(max)
  })
})

/* #region  Check Similarity */
function similarityFn(s1, s2) {
  if (!s1 || !s2) return 0
  var longer = s1
  var shorter = s2
  if (s1.length < s2.length) {
    longer = s2
    shorter = s1
  }
  var longerLength = longer.length
  if (longerLength == 0) {
    return 1.0
  }
  return (
    (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)
  )
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase()
  s2 = s2.toLowerCase()

  var costs = new Array()
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j
      else {
        if (j > 0) {
          var newValue = costs[j - 1]
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
          costs[j - 1] = lastValue
          lastValue = newValue
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }
  return costs[s2.length]
}

/* #endregion */
