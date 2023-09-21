/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Item } from '../Interface'

function getYoutubeInfo() {
  const youtubePlayer: HTMLVideoElement | null = document.querySelector('.video-stream')
  const titleEle = document.getElementById('title')
  const title = titleEle && titleEle.innerHTML
  const currentTime = youtubePlayer && youtubePlayer.currentTime
  if (!youtubePlayer || !title) return
  return { title, timeStamp: getTime(currentTime) }
}

function getTime(t) {
  const date = new Date(0)
  date.setSeconds(t)
  return date.toISOString().substr(11, 8)
}

async function handleScreenShot(tab) {
  if (!tab.url.includes('youtube.com/watch')) {
    console.log('Not a youtube watch page')
    return
  }
  const video = document.querySelector('video')
  const overlayEle = document.getElementById('youtube-quick-note-overlay')

  if (overlayEle) {
    overlayEle.remove()
    if (video && video.paused) {
      video.play()
    }
    return
  }
  const overlay = document.createElement('div')
  overlay.id = 'youtube-quick-note-overlay'
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100%'
  overlay.style.height = '100%'
  overlay.style.backgroundColor = 'rgba(128, 128, 128, 0.5)' // Gray with 50% opacity
  overlay.style.zIndex = '9999' // Ensure it's on top of other elements
  if (video && !video.paused) {
    const currentYoutubeInfo = getYoutubeInfo()
    if (!currentYoutubeInfo) return
    const queryParameters = tab.url.split('?')[1]
    const urlParameters = new URLSearchParams(queryParameters)
    const vid = urlParameters.get('v')
    video.pause()
    document.body.appendChild(overlay)
    const result = handleAddBookmark({
      title: currentYoutubeInfo.title,
      tabID: tab.id,
      vid: vid!,
      notes: [{ desc: '', timeStamp: currentYoutubeInfo.timeStamp, attachment: '' }],
      url: tab.url,
      createdAt: new Date().toISOString()
    })
    return result
  }
}
const fetchBookmarks = async () => {
  const getStorage = await chrome.storage.local.get(['data'])
  console.log(getStorage)
  if (getStorage && getStorage.data) {
    return JSON.parse(getStorage.data)
  }
}

const handleAddBookmark = async (newBookmark: Item) => {
  let bookmarks = await fetchBookmarks()
  if (!bookmarks) {
    bookmarks = {}
  }
  const { vid, notes } = newBookmark
  if (bookmarks[vid]) {
    bookmarks[vid].notes.push({
      desc: notes[0].desc || '',
      timeStamp: notes[0].timeStamp,
      attachment: notes[0].attachment || ''
    })
  } else {
    bookmarks[vid] = newBookmark
  }
  return new Promise((resolve) => {
    chrome.storage.local.set({ data: JSON.stringify(bookmarks) }, () => {
      resolve(bookmarks)
    })
  })
  // const storage = chrome.storage.local.set({ data: JSON.stringify(bookmarks) })
  // storage.then(() => {
  //   console.log("before return")
  //   return bookmarks
  // })
}

const clearLocalStorage = () => {
  chrome.storage.local.clear(() => {
    console.log('cleared all')
  })
}
;(() => {
  chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
    // Handle the message here
    const tab = JSON.parse(message.tab)
    const bookmarks = await handleScreenShot(tab)
    console.log(bookmarks)
    sendResponse(bookmarks)
    return true
  })
})()
