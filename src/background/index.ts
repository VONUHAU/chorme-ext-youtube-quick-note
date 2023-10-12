import { getCurrentTab } from '../../utils'
// chrome.runtime.onInstalled.addListener(function (details) {
//   try {
//     const thisVersion = chrome.runtime.getManifest().version
//     if (details.reason == 'install') {
//       console.info('First version installed')
//       //Send message to popup.html and notify/alert user("Welcome")
//     } else if (details.reason == 'update') {
//       console.info('Updated version: ' + thisVersion)
//       //Send message to popup.html and notify/alert user
//       chrome.runtime.sendMessage({ name: 'showPopupOnUpdated', version: thisVersion })
//     }
//   } catch (e) {
//     console.info('OnInstall Error - ' + e)
//   }
// })

// // when update youtube watch tab
const youtubeUrl = 'youtube.com/watch'
chrome.tabs.onUpdated.addListener(async (tabId, _changeInfo, tab) => {
  if (tab.url && tab.url.includes(youtubeUrl)) {
    chrome.tabs.sendMessage(tab.id!, {
      type: 'TAB_UPDATE'
    })
  }
  return true
})

chrome.commands.onCommand.addListener(async (command) => {
  if (command == 'Quick bookmark') {
    const tab = await getCurrentTab()
    if (!tab.url!.includes('youtube.com/watch')) {
      return
    }
    chrome.tabs.sendMessage(tab.id!, { type: 'BOOKMARK', tab: JSON.stringify(tab) })
  }
})

// function playAtTime(time: number) {
//   let youtubePlayer: HTMLVideoElement | null = document.querySelector('.video-stream')
//   console.log(youtubePlayer)
//   window.onload = () => {
//     console.log(youtubePlayer)
//     if (!youtubePlayer) {
//       youtubePlayer = document.querySelector('.video-stream')
//       youtubePlayer.currentTime = time
//     }
//   }
// }

chrome.runtime.onMessage.addListener(async function (request) {
  if (request.type == 'OPEN_NEW_TAB') {
    chrome.tabs.create({ url: request.url })
    return true
  }
  // if (request.type == 'PLAY') {
  //   const newTab = await chrome.tabs.create({ url: request.url })
  //   chrome.scripting
  //     .executeScript({
  //       target: { tabId: newTab.id! },
  //       func: playAtTime,
  //       args: [request.time]
  //     })
  //     .then(() => console.log('script injected'))
  // }
})
