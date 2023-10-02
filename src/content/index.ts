/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Item } from '../Interface'

let isCapturing = false
let startX, startY, endX, endY
let captureImageData = ''

function stopScreenshot() {
  isCapturing = false
  document.getElementById('youtube-quick-note-overlay')?.remove()
  document.getElementById('youtube-quick-note-capture-area')?.remove()
  captureImageData = captureAndExtractText()
}

document.addEventListener('mousedown', (e) => {
  if (isCapturing) {
    startX = e.clientX
    startY = e.clientY
    document.getElementById('youtube-quick-note-capture-area')!.style.left = startX + 'px'
    document.getElementById('youtube-quick-note-capture-area')!.style.top = startY + 'px'
  }
})

document.addEventListener('mousemove', (e) => {
  if (isCapturing) {
    endX = e.clientX
    endY = e.clientY
    const width = endX - startX
    const height = endY - startY
    document.getElementById('youtube-quick-note-capture-area')!.style.width = width + 'px'
    document.getElementById('youtube-quick-note-capture-area')!.style.height = height + 'px'
  }
})

document.addEventListener('mouseup', (e) => {
  if (isCapturing) {
    stopScreenshot()
  }
})

async function captureAndExtractText() {
  const x = startX
  const y = startY
  const width = endX - startX
  const height = endY - startY

  // Capture the selected area as an image
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const video = document.getElementsByTagName('video')

  ctx.drawImage(video, x, y, width, height, 0, 0, width, height)

  // Convert the canvas to a data URL
  const imageDataUrl = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = screenshotURL
  link.download = 'screenshot.png'
  link.click()
  return imageDataUrl
}

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
  //add overlay element
  const overlay = document.createElement('div')
  overlay.id = 'youtube-quick-note-overlay'
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100%'
  overlay.style.height = '100%'
  overlay.style.backgroundColor = 'rgba(128, 128, 128, 0.5)' // Gray with 50% opacity
  overlay.style.zIndex = '9999' // Ensure it's on top of other elements
  // add capture area element
  const captureArea = document.createElement('div')
  captureArea.id = 'youtube-quick-note-capture-area'
  captureArea.style.border = '2px dashed white'
  captureArea.style.position = 'absolute'
  document.body.appendChild(overlay)
  document.body.appendChild(captureArea)
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
    if (isExtract) {
      isCapturing = true
      addOverLayer()
      console.log(captureImageData)
    }

    const result = handleAddBookmark({
      title: currentYoutubeInfo.title,
      tabID: tab.id,
      vid: vid!,
      notes: [{ id: Date.now(), desc: '', timeStamp: currentYoutubeInfo.timeStamp, attachment: '' }],
      url: tab.url,
      createdAt: new Date().toISOString()
    })
    return { ...result, imageData: JSON.stringify(captureImageData) }
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
  let newNote = null
  if (bookmarks[vid]) {
    const cloneNotes = JSON.parse(JSON.stringify(bookmarks[vid].notes))
    // Check for duplicate timestamps to prevent data redundancy
    const isExist = cloneNotes.findIndex(
      (note: any) => formatTimeStamp(note.timeStamp) == formatTimeStamp(notes[0].timeStamp)
    )
    if (isExist >= 0) {
      response.status = 'fail'
      response.message = 'The timestamp already exists.'
      index = isExist
      newNote = cloneNotes[index]
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
      }
    }
  })
})()
