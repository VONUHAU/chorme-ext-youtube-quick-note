// chrome.runtime.onInstalled.addListener(() => {
//   chrome.action.setBadgeText({
//     text: 'OFF'
//   })
// })

// // when update youtube watch tab
// const youtubeUrl = 'youtube.com/watch'

// chrome.tabs.onUpdated.addListener(async (tabId, tab) => {
//   if (tab.url && tab.url.includes(youtubeUrl)) {
//     const prevState = await chrome.action.getBadgeText({ tabId: tab.id })
//     // Next state will always be the opposite
//     const nextState = prevState === 'ON' ? 'OFF' : 'ON'

//     // Set the action badge to the next state
//     await chrome.action.setBadgeText({
//       tabId: tab.id,
//       text: nextState
//     })
//     const queryParameters = tab.url.split('?')[1]
//     const urlParameters = new URLSearchParams(queryParameters)

//     chrome.tabs.sendMessage(tabId, {
//       type: 'NEW',
//       videoId: urlParameters.get('v')
//     })
//   }
// })

function playAtTime(time: number) {
  console.log('hello play at time')
  document.addEventListener('DOMContentLoaded', function () {
    const youtubePlayer: HTMLVideoElement | null = document.querySelector('.video-stream')
    console.log(youtubePlayer)
    youtubePlayer.currentTime = time
  })
}

chrome.runtime.onMessage.addListener(async function (request) {
  console.log(request.openNewTab)
  if (request.openNewTab) {
    const data = JSON.parse(request.openNewTab)
    const newTab = await chrome.tabs.create({ url: data.url })
    console.log(newTab)
    chrome.scripting
      .executeScript({
        target: { tabId: newTab.id! },
        func: playAtTime,
        args: [data.time]
      })
      .then(() => console.log('script injected'))
  }
})
