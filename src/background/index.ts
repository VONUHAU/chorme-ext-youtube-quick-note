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

chrome.commands.onCommand.addListener((command) => {
  console.log(`Command: ${command}`)
})

function playAtTime(time: number) {
  console.log('hello play at time')
  try {
    let youtubePlayer: HTMLVideoElement | null = document.querySelector('.video-stream')
    youtubePlayer.currentTime = time
    window.onload = () => {
      if (!youtubePlayer) {
        youtubePlayer = document.querySelector('.video-stream')
        youtubePlayer.currentTime = time
      }
    }
  } catch (err) {
    console.log(err)
  }
}

chrome.runtime.onMessage.addListener(async function (request) {
  if (request.type == 'PLAY') {
    console.log('new tab is open')
    const newTab = await chrome.tabs.create({ url: request.url })
    console.log(newTab)
    chrome.scripting
      .executeScript({
        target: { tabId: newTab.id! },
        func: playAtTime,
        args: [request.time]
      })
      .then(() => console.log('script injected'))
  }
})
