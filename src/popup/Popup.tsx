import { useState, useEffect } from 'react'
import Card from '../components/card.tsx'
import './index.css'

type Item = {
  tabID: string
  title?: string
  desc?: string
  timeStamp: string
  attachment?: string[]
  url?: string
}
function App() {
  const [isCapture, setCapture] = useState(false)
  const [bookmark, setBookmark] = useState<Item>()
  const [data, setData] = useState<Item[]>([])
  // handle load data from chrome storage
  useEffect(() => {
    chrome.storage.sync.get(['Ydata'], (data) => {
      const videoNote = data['Ydata'] ? JSON.parse(data['Ydata']) : []
      setData(videoNote)
      console.log(data)
    })
  }, [])

  const handleCapture = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0]
      const { id: tabId, url } = activeTab
      chrome.scripting
        .executeScript({
          target: { tabId },
          function: handleScreenShot,
          args: [tabId, url]
        })
        .then(() => console.log('injected a function'))
    })
  }
  const getYoutubeInfo = () => {
    const youtubePlayer: HTMLVideoElement | null = document.querySelector('.video-stream')
    const titleEle = document.querySelector('.style-scope ytd-watch-metadata')
    const title = titleEle ? titleEle.innerHTML : null
    const currentTime = youtubePlayer ? youtubePlayer.currentTime : null
    console.log('dubug on the current youtube info')
    if (!youtubePlayer && !title) return
    console.log(`current time: ${currentTime}`)
    return { title, timeStamp: getTime(currentTime) }
  }
  const getTime = (t) => {
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
  const handleScreenShot = (tabId, url) => {
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
      // const currentYoutubeInfo = getYoutubeInfo()
      // console.log(currentYoutubeInfo)
      // if (!currentYoutubeInfo) return
      // handleOnSave({ ...currentYoutubeInfo, tabId })
    
      const youtubePlayer: HTMLVideoElement | null = document.querySelector('.video-stream')
      const titleEle = document.querySelector('.style-scope ytd-watch-metadata')
      const title = titleEle ? titleEle.innerHTML : null
      const currentTime = youtubePlayer ? youtubePlayer.currentTime : null
      console.log(title, currentTime)
      console.log("hey")
      video.pause()
      document.body.appendChild(overlay)
      }
  }
  return (
    <div className='p-4 app dark'>
      <section className='task mb-3'>
        <div className='flex flex-row gap-2 justify-start items-center'>
          <button
            onClick={handleCapture}
            className='bg-slate-700 dark:bg-accent text-background rounded cursor-pointer'
          >
            {' '}
            Capture{' '}
          </button>
          <button className='bg-slate-700 dark:bg-primary text-white rounded cursor-pointer'> Remove All</button>
        </div>
      </section>
      <section className='space-y-3'>
        <Card
          title='100+ Web Development Things you Should Know'
          content={[{ index: '01234', timeStamp: 'timeStamp', desc: 'hello desc' }]}
          url='https://www.youtube.com/watch?v=erEgovG9WBs'
        />
        <Card
          title='100+ Web Development Things you Should Know'
          content={[{ index: '01234', timeStamp: 'timeStamp', desc: 'hello desc' }]}
          url='https://www.youtube.com/watch?v=erEgovG9WBs'
        />
        <Card
          title='100+ Web Development Things you Should Know'
          content={[{ index: '01234', timeStamp: 'timeStamp', desc: 'hello desc' }]}
          url='https://www.youtube.com/watch?v=erEgovG9WBs'
        />
      </section>
    </div>
  )
}

export default App
