
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Item } from '../Interface'

async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true }
  const [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

function getYoutubeInfo(){
  const youtubePlayer: HTMLVideoElement | null = document.querySelector('.video-stream')
  const titleEle = document.querySelector('.style-scope ytd-watch-metadata')
  const title = titleEle ? titleEle.innerHTML : null
  const currentTime = youtubePlayer ? youtubePlayer.currentTime : null
  console.log('dubug on the current youtube info')
  if (!youtubePlayer && !title) return
  console.log(`current time: ${currentTime}`)
  return { title, timeStamp: getTime(currentTime) }
}

function getTime(t){
  const date = new Date(0)
  date.setSeconds(t)
  return date.toISOString().substr(11, 8)
}

const handleOnSave = (item: Item) => {
  if (!item) return
  const newData = [...data]
  let isNewData = false
  for (const i in newData) {
    if (newData[i].tabID == item.tabID) {
      newData[i] = { ...newData[i], ...item }
      isNewData = false
      break
    }
  }
  !isNewData && newData.unshift(item)
  chrome.storage.sync.set({ 'y-data': JSON.stringify(newData) }).then(() => {
    console.log('Save successfully!')
  })
}

async function handleScreenShot() {
  const tab = await getCurrentTab()
  const { url, id } = tab
  if (!url.includes('youtube.com/watch')) {
    console.log('Not a youtube watch page')
    return
  }
  const video = document.querySelector('video')
  const overlayEle = document.getElementById('youtube-quick-note-overlay')
  console.log(url)
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
    console.log(currentYoutubeInfo)
    if (!currentYoutubeInfo) return
    video.pause()
    document.body.appendChild(overlay)
    // handleOnSave({ ...currentYoutubeInfo, tabId })
  }
}