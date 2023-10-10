
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.action.setBadgeText({
//     text: 'OFF'
//   })
// })

import { getCurrentTab } from "../../utils"

// // when update youtube watch tab

const youtubeUrl = 'youtube.com/watch'
chrome.tabs.onUpdated.addListener(async (tabId, _changeInfo, tab) => {
  console.log(tabId, tab.id)
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
    chrome.tabs.sendMessage(tab.id!, {type: 'BOOKMARK',tab: JSON.stringify(tab)})
  }
})

function playAtTime(time: number) {
  let youtubePlayer: HTMLVideoElement | null = document.querySelector('.video-stream')
  window.onload = () => {
    if (!youtubePlayer) {
      youtubePlayer = document.querySelector('.video-stream')
      youtubePlayer.currentTime = time
    }
  }
}

chrome.runtime.onMessage.addListener(async function (request) {
  if (request.type == 'PLAY') {
    const newTab = await chrome.tabs.create({ url: request.url })
    chrome.scripting
      .executeScript({
        target: { tabId: newTab.id! },
        func: playAtTime,
        args: [request.time]
      })
      .then(() => console.log('script injected'))
  }
})
