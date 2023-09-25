/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Item } from '../Interface'

function getYoutubeInfo() {
  const youtubePlayer: HTMLVideoElement | null = document.querySelector('.video-stream')
  const titleEle = document.querySelector('#title h1.style-scope.ytd-watch-metadata .style-scope.ytd-watch-metadata')
  const title = titleEle && titleEle.innerText
  const currentTime = youtubePlayer && youtubePlayer.currentTime
  if (!youtubePlayer || !title) return
  return { title, timeStamp: currentTime }
}

function removeOverlay() {
  const overlayEle = document.getElementById('youtube-quick-note-overlay')
  if (overlayEle) {
    overlayEle.remove()
  }
}

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true }
  const [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

function extractYouTubeVideoId(url) {
  // Regular expression to match the video ID in the URL
  const regex = /[?&]v=([^?&]+)/

  // Use the regex to extract the video ID
  const match = url.match(regex)

  // If a match is found, return the video ID; otherwise, return null
  if (match) {
    return match[1]
  } else {
    return null
  }
}

function getCurrentVid() {
  const url = window.location.href
  const regex = /[?&]v=([^?&]+)/
  const match = url.match(regex)
  if (match) {
    return match[1]
  }
  return null
}
function addOverLayer() {
  const overlay = document.createElement('div')
  overlay.id = 'youtube-quick-note-overlay'
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100%'
  overlay.style.height = '100%'
  overlay.style.backgroundColor = 'rgba(128, 128, 128, 0.5)' // Gray with 50% opacity
  overlay.style.zIndex = '9999' // Ensure it's on top of other elements
  document.body.appendChild(overlay)
}

async function handleScreenShot(tab: any, isExtract?: boolean) {
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
  if (video) {
    const currentYoutubeInfo = getYoutubeInfo()
    if (!currentYoutubeInfo) return
    const queryParameters = tab.url.split('?')[1]
    const urlParameters = new URLSearchParams(queryParameters)
    const vid = urlParameters.get('v')
    video.pause()
    isExtract && addOverLayer()
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
}

const playAtTine = (time: number) => {
  const youtubePlayer: HTMLVideoElement | null = document.querySelector('.video-stream')
  youtubePlayer.currentTime = time
}

const clearLocalStorage = () => {
  chrome.storage.local.clear(() => {
    console.log('cleared all')
  })
}
const handleResponse = async (sendResponse: (response: any) => void, tab: any, isExtract: boolean = false) => {
  const bookmarks = await handleScreenShot(tab, isExtract)
  console.log(bookmarks)
  sendResponse(bookmarks)
}

;(() => {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    // Handle the message here
    if (message.type == 'BOOKMARK') {
      const tab = JSON.parse(message.tab)
      handleResponse(sendResponse, tab)
      return true
    }
    if (message.type == 'EXTRACT') {
      const tab = JSON.parse(message.tab)
      handleResponse(sendResponse, tab, true)
      return true
    }
    if (message.type == 'OPEN_NEW_TAB') {
      window.open(message.url, '_blank')
      return true
    }
    if (message.type == 'PLAY') {
      removeOverlay() // remove over layer if it existed
      console.log(`${getCurrentVid()} url: ${message.url} time: ${message.time}`)
      if (getCurrentVid() == message.vid) {
        playAtTine(message.time)
      } else {
        chrome.runtime.sendMessage({ openNewTab: JSON.stringify({ url: message.url, time: message.time }) })
      }
    }
  })
})()
