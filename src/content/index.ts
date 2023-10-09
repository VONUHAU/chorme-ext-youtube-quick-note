/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Item } from '../Interface'

let isCapturing = false
let startX: number, startY: number, endX: number, endY: number
const captureImageData = ''

function convertVietnameseToNormal(text: string) {
  // Define a mapping of Vietnamese diacritical characters to their non-diacritical counterparts
  const diacriticsMap = {
    à: 'a',
    á: 'a',
    ả: 'a',
    ã: 'a',
    ạ: 'a',
    â: 'a',
    À: 'A',
    Â: 'A',
    Á: 'A',
    Ả: 'A',
    Ã: 'A',
    Ạ: 'A',
    è: 'e',
    é: 'e',
    ẻ: 'e',
    ẽ: 'e',
    ẹ: 'e',
    È: 'E',
    É: 'E',
    Ẻ: 'E',
    Ẽ: 'E',
    Ẹ: 'E',
    ì: 'i',
    í: 'i',
    ỉ: 'i',
    ĩ: 'i',
    ị: 'i',
    Ì: 'I',
    Í: 'I',
    Ỉ: 'I',
    Ĩ: 'I',
    Ị: 'I',
    ò: 'o',
    ó: 'o',
    ỏ: 'o',
    ở: 'o',
    õ: 'o',
    ọ: 'o',
    Ò: 'O',
    Ó: 'O',
    Ỏ: 'O',
    Ở: 'O',
    Õ: 'O',
    Ọ: 'O',
    ù: 'u',
    ú: 'u',
    ủ: 'u',
    ũ: 'u',
    ụ: 'u',
    ư: 'u',
    Ù: 'U',
    Ú: 'U',
    Ủ: 'U',
    Ũ: 'U',
    Ư: 'U',
    Ụ: 'U',
    ỳ: 'y',
    ý: 'y',
    ỷ: 'y',
    ỹ: 'y',
    ỵ: 'y',
    Ỳ: 'Y',
    Ý: 'Y',
    Ỷ: 'Y',
    Ỹ: 'Y',
    Ỵ: 'Y',
    đ: 'd',
    Đ: 'D'
  }

  // Use a regular expression to match diacritics and replace them with their non-diacritical counterparts
  return text.replace(
    /[àáảãạÀÁẢÃẠèéẻẽẹÈÉẺẼẸìíỉĩịÌÍỈĨỊòóỏõọÒÓỎÕỌùúủũụÙÚỦŨỤỳýỷỹỵỲÝỶỸỴđĐ]/g,
    (match: string) => diacriticsMap[match as keyof typeof diacriticsMap] || match
  )
}

function convertDurationToTimeStamp(durationString) {
  const parts = durationString.split(':').map(Number)

  if (parts.length === 2) {
    // Format: M:SS
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    // Format: H:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else {
    throw new Error('Invalid duration format. Please use "M:SS" or "H:MM:SS" format.')
  }
}

async function addBookmarksOnTimeLine() {
  // get is hidden bookmark setting
  const getStorage = await chrome.storage.local.get(['hiddenBookmarks'])
  console.log(getStorage.hiddenBookmarks)
  if (getStorage.hiddenBookmarks == true) {
    return
  }

  const vid = getCurrentVid()
  if (!vid) return
  const data = await fetchBookmarks()
  if (!data) return
  const notes = data[vid].notes
  console.log(vid, data, notes)
  if (!notes || notes.length < 1) return
  const timelineELe = document.getElementsByClassName('ytp-progress-bar')[0]
  // retry after 200ms if can't get the timeline element
  let duration = document.getElementsByClassName('ytp-time-duration')[0].innerText
  if (!timelineELe || !duration) {
    setTimeout(() => {
      addBookmarksOnTimeLine()
    }, 200)
  }
  if (!duration) return
  console.log(duration)
  duration = convertDurationToTimeStamp(duration)
  // get setting color
  let color = '#59eb2c'
  const settingColor = await chrome.storage.local.get(['bookmarkColor'])
  console.log(settingColor.bookmarkColor)
  if (settingColor || settingColor.bookmarkColor) {
    const rgba = JSON.parse(settingColor.bookmarkColor)
    color = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
  }

  timelineELe.style.position = 'relative'
  const youtubePlayer: HTMLVideoElement | null = document.querySelector('.video-stream')
  // create new bookmarks note child elements
  for (const note of notes) {
    const time = note.timeStamp
    const childElement = document.createElement('div')
    childElement.className = `bookmark-timeline v-${time}`
    childElement.style.background = color
    childElement.style.left = `${(time / duration) * 100}%`
    childElement.addEventListener('onClick', () => {
      youtubePlayer!.currentTime = time
    })
    // create hover content for for childEle
    if (note.desc) {
      const descEle = document.createElement('div')
      descEle.className = `bookmark-timeline-content ${time}`
      descEle.style.background = 'gray'
      descEle.innerHTML = note.desc
      childElement.appendChild(descEle)
    }

    timelineELe.appendChild(childElement)
  }
}
// init bookmarks
addBookmarksOnTimeLine()

async function addBookmarkOnTimeLine(vid: string, note) {
  // get is hidden bookmark setting
  const getStorage = await chrome.storage.local.get(['hiddenBookmarks'])
  console.log(getStorage.hiddenBookmarks)
  if (getStorage.hiddenBookmarks == true) {
    return
  }

  if (!vid || !note) return
  const timelineELe = document.getElementsByClassName('ytp-progress-bar')[0]
  // retry after 200ms if can't get the timeline or duration element
  let duration = document.getElementsByClassName('ytp-time-duration')[0].innerText
  if (!timelineELe || !duration) {
    setTimeout(() => {
      addBookmarkOnTimeLine(vid, note)
    }, 200)
  }
  if (!duration) return
  duration = convertDurationToTimeStamp(duration)
  // get color setting
  let color = '#59eb2c'
  const settingColor = await chrome.storage.local.get(['bookmarkColor'])
  if (settingColor || settingColor.bookmarkColor) {
    const rgba = JSON.parse(settingColor.bookmarkColor)
    color = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
  }

  timelineELe.style.position = 'relative'
  const youtubePlayer: HTMLVideoElement | null = document.querySelector('.video-stream')
  // create new bookmarks note child elements
  const time = note.timeStamp
  const childElement = document.createElement('div')
  childElement.className = `bookmark-timeline v-${time}`
  childElement.style.background = color
  childElement.style.left = `${(time / duration) * 100}%`
  childElement.addEventListener('onClick', () => {
    youtubePlayer!.currentTime = time
  })
  // create hover content for for childEle
  if (note.desc) {
    const descEle = document.createElement('div')
    descEle.className = `bookmark-timeline-content ${time}`
    descEle.style.background = 'gray'
    descEle.innerHTML = note.desc
    childElement.appendChild(descEle)
  }
  timelineELe.appendChild(childElement)
}

async function updateNote(vid: string, time: string, desc: string) {
  if (!vid || !desc) return
  const bookmarkELes = document.getElementsByClassName(time)[0]
  if (bookmarkELes) {
    bookmarkELes.innerHTML = desc
    return
  }
  const noteEle = document.getElementsByClassName(`v-${time}`)[0]
  const descEle = document.createElement('div')
  descEle.className = `bookmark-timeline-content ${time}`
  descEle.style.background = 'gray'
  descEle.innerHTML = desc
  noteEle.appendChild(descEle)
}

async function updateUISetting() {

}
async function removeBookmark(time: string) {
  console.log('hey remove')
  document.getElementsByClassName(`v-${time}`)[0].remove()
}
async function removeBookmarks() {
  console.log('hey remove all')
  const bookmarkELes = document.querySelectorAll('.bookmark-timeline')
  console.log(bookmarkELes)
  for (const ele of bookmarkELes) {
    ele.remove()
  }
}

function stopScreenshot() {
  isCapturing = false
  document.getElementById('youtube-quick-note-overlay')?.remove()
  document.getElementById('youtube-quick-note-capture-area')?.remove()
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
    document.body.style.cursor = 'crosshair'
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
    document.body.style.cursor = 'auto'
    stopScreenshot()
  }
})

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
      addOverLayer()
      isCapturing = true
    }
    const note = { id: Date.now(), desc: '', timeStamp: currentYoutubeInfo.timeStamp, attachment: '' }
    const result = handleAddBookmark({
      title: currentYoutubeInfo.title,
      tabID: tab.id,
      vid: vid!,
      notes: [note],
      url: tab.url,
      search: convertVietnameseToNormal(currentYoutubeInfo.title),
      createdAt: new Date().toISOString()
    })
    addBookmarkOnTimeLine(vid, note)
    return result
  }
}
async function fetchBookmarks() {
  const getStorage = await chrome.storage.local.get(['data'])
  if (getStorage && getStorage.data) {
    return JSON.parse(getStorage.data)
  }
}

async function getStorageData(keyName: string, dataType = null) {
  const getStorage = await chrome.storage.local.get([keyName])
  if (getStorage && getStorage[keyName]) {
    if (!dataType) {
      return JSON.parse(getStorage[keyName])
    }
    return getStorage[keyName]
  }
}

type BookmarkProp = {
  status: string
  message: string
  data: Item
}
const handleAddBookmark = async (newBookmark: Item): Promise<BookmarkProp> => {
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
    if (message.type == 'REMOVE_BOOKMARK') {
      console.log(message.time)
      removeBookmark(message.time)
      return
    }
    if (message.type == 'REMOVE_ALL_BOOKMARK') {
      removeBookmarks()
      return
    }
    if (message.type == 'UPDATE_CONTENT_UI_SETTING') {
      updateUISetting()
      return
    }
    if (message.type == 'ADD_NOTE') {
      updateNote(message.vid, message.time, message.desc)
      return
    }
    
    if (message.type == 'OPEN_NEW_TAB') {
      window.open(message.url, '_blank')
      return true
    }
    if (message.type == 'PLAY') {
      removeOverlay() // remove over layer if it existed
      if (getCurrentVid() == message.vid) {
        playAtTine(message.time)
      } else {
        chrome.runtime.sendMessage(message)
      }
    }
  })
})()
