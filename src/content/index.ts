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
function formatTimeStamp(time: number) {
  const date = new Date(0)
  date.setSeconds(time)
  return date.toISOString().substr(11, 8)
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
      notes: [{ id: Date.now(), desc: '', timeStamp: currentYoutubeInfo.timeStamp, attachment: '' }],
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
  const response = { status: '', message: '', data: {} }
  const { vid, notes } = newBookmark
  let index = null
  let newNote = {}
  if (bookmarks[vid]) {
    const cloneNotes = JSON.parse(JSON.stringify(bookmarks[vid].notes))
    // Check for duplicate timestamps to prevent data redundancy
    const isExist = cloneNotes.some(
      (note: any) => formatTimeStamp(note.timeStamp) == formatTimeStamp(notes[0].timeStamp)
    )
    if (isExist) {
      response.status = 'fail'
      response.message = 'The timestamp already exists.'
    } else {
      newNote = {
        id: notes[0].id,
        desc: notes[0].desc || '',
        timeStamp: notes[0].timeStamp,
        attachment: notes[0].attachment || ''
      }
      cloneNotes.unshift(newNote)
      index = cloneNotes.findIndex((item) => item.id === notes[0].id)
      response.status = 'success'
      bookmarks[vid].notes = cloneNotes
    }
  } else {
    bookmarks[vid] = newBookmark
  }
  const cloneBookmark = JSON.parse(JSON.stringify(bookmarks))
  if (index) {
    cloneBookmark[vid].notes.splice(index, 1)
    cloneBookmark[vid].notes.unshift(newNote)
  }
  console.log(index, cloneBookmark)
  response.data = cloneBookmark
  return new Promise((resolve) => {
    chrome.storage.local.set({ data: JSON.stringify(bookmarks) }, () => {
      resolve(response)
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
