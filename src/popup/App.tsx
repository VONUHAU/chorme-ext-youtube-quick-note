import { useState, useEffect, useRef } from 'react'
import { Card } from '../components/card.tsx'
import Toast from '../components/toast.tsx'
import { getCurrentTab, fetchBookmarks } from '../../utils/index.ts'
import { Item } from '../Interface/index.ts'
import SearchBar from '../components/SearchBar.tsx'
import { SettingModal } from '../components/setting.tsx'
import './index.css'

function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>([])
  const [mapData, setMapData] = useState<Item[]>([])
  const [toast, setToast] = useState<string>('')
  const [modalOpen, setModalOpen] = useState(false)
  const carRef = useRef([])

  // handle load data from chrome storage
  useEffect(() => {
    const initData = async () => {
      const result = await Promise.allSettled([fetchBookmarks(), getCurrentTab()])
      const [storageData, tab] = result
      const obj = storageData.value
      let currentItem = null
      if (tab.value) {
        console.log(tab.value)
        const queryParameters = tab.value.url.split('?')[1]
        const urlParameters = new URLSearchParams(queryParameters)
        const vid = urlParameters.get('v')
        if (obj[vid]) {
          currentItem = obj[vid]
          delete obj[vid]
        }
      }
      let bookmarks: Item[] = Object.values(obj)
      bookmarks = bookmarks.sort((a: Item, b: Item) => new Date(b.createdAt) - new Date(a.createdAt))
      if (currentItem) {
        currentItem.isExpand = true
        bookmarks.unshift(currentItem)
      }
      setData(bookmarks)
    }
    initData()
  }, [])

  const handleClearStorageData = () => {
    chrome.storage.local.clear(() => {
      setData([])
    })
  }

  const handleExtractText = () => {
    console.log('extract')
    // Capture the selected area as an image
    chrome.tabs.captureVisibleTab({ format: 'png' }, (screenshotUrl) => {
      // Create an HTML5 Image object
      const img = new Image()
      // Load the screenshot URL into the Image object
      img.src = screenshotUrl
      // When the image is loaded, create a canvas and draw the cropped portion
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        // Set the canvas dimensions to match the cropped area
        canvas.width = width
        canvas.height = height
        // Draw the cropped portion of the screenshot onto the canvas
        context.drawImage(img, x, y, width, height, 0, 0, width, height)
        // Convert the canvas to a data URL
        const croppedScreenshotUrl = canvas.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = croppedScreenshotUrl
        link.download = 'screenshot.png'
        link.click()
      }
    })
  }
  const handleCapture = async (type: string) => {
    const tab = await getCurrentTab()
    if (!tab.url!.includes('youtube.com/watch')) {
      setToast('Please go to the YouTube watch page to use the bookmark feature')
      return
    }
    chrome.tabs.sendMessage(tab.id!, { type, tab: JSON.stringify(tab) }, (response) => {
      if (!response) {
        setToast('Oops, something went wrong, please try again')
        return
      }
      if (type == 'EXTRACT') {
        handleExtractText()
      }
      let data = response.data
      const queryParameters = tab.url!.split('?')[1]
      const urlParameters = new URLSearchParams(queryParameters)
      const vid = urlParameters.get('v')
      const activeObj = data[vid!]
      activeObj.isExpand = true
      activeObj.newCreated = true
      delete data[vid!]
      data = Object.values(data)
      data.unshift(activeObj)
      setData(data)
    })
  }

  useEffect(() => {
    setMapData(data)
  }, [data])

  const handleToggleAccordion = (index: number) => {
    carRef.current.map((ele, key) => {
      const cardDetail = ele.children[1]
      if (key == index) {
        if (cardDetail.classList.contains('card-open')) {
          cardDetail.classList.remove('card-open')
        } else {
          cardDetail.classList.add('card-open')
        }
      } else {
        cardDetail.classList.remove('card-open')
      }
    })
  }

  return (
    <>
      <div className='blur-bg'></div>
      <div className='p-3 app dark h-full overflow-y-[overlay]'>
        <div
          className={
            data.length > 0
              ? 'relative top-0  transition-all ease-in-out rotate-360 origin-[0%_0%]'
              : 'relative left-1/2 top-1/2 transition-all ease-in-out rotate-0 translate-y-[-50%] translate-x-[-50%]'
          }
        >
          <div className={data.length > 0 ? 'flex items-center justify-center' : 'flex items-center justify-start'}>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 150 50'
              className={data.length > 0 ? 'w-[160px] fill-white' : 'w-[200px] fill-white'}
            >
              <path d='M1.06,20.06a.85.85,0,0,1-.85-.84V9.65A1.25,1.25,0,0,1,1.46,8.4H11a.85.85,0,1,1,0,1.69H1.9v9.13A.85.85,0,0,1,1.06,20.06Z' />
              <path d='M35,20.06a.85.85,0,0,1-.85-.84V10.09H25A.85.85,0,0,1,25,8.4h9.57A1.25,1.25,0,0,1,35.8,9.65v9.57A.85.85,0,0,1,35,20.06Zm-.41-10h0Z' />
              <path d='M34.34,44.17H24.77a.85.85,0,0,1,0-1.69H33.9V33.35a.85.85,0,0,1,1.69,0v9.57A1.25,1.25,0,0,1,34.34,44.17Z' />
              <path d='M10.82,44.17H1.25A1.25,1.25,0,0,1,0,42.92V33.35a.84.84,0,0,1,.84-.84.84.84,0,0,1,.85.84v9.13h9.13a.85.85,0,0,1,0,1.69Z' />
              <path d='M17.66,25.06c-.87.85-1.92,1.82-3.16,2.93a22.6,22.6,0,0,1-1.87,1.51,3,3,0,0,1-1.79.62,1.56,1.56,0,0,1-1.43-1A2.58,2.58,0,0,1,9.15,28a11.43,11.43,0,0,1,1.67-5.14A23,23,0,0,1,15,17.54Q17.56,15,18.64,15a.63.63,0,0,1,.46.2.67.67,0,0,1,.18.47,1,1,0,0,1-.32.76,7.07,7.07,0,0,1-.78.54,15.21,15.21,0,0,0-2.28,1.91,18.46,18.46,0,0,0-3.45,4.61A10.44,10.44,0,0,0,11,27.33a.71.71,0,0,0,.15.44.59.59,0,0,0,.52.28,4.62,4.62,0,0,0,2.14-1.2,23.44,23.44,0,0,0,2.92-2.61,72.06,72.06,0,0,0,4.88-5.7q1.56-2.12,2.63-3.38c.6-.71,1.07-1.07,1.39-1.07a.67.67,0,0,1,.56.33,1,1,0,0,1,.18.61,2.41,2.41,0,0,1-.62,1.38q-4.45,5.84-5.9,8a48.84,48.84,0,0,0-3.79,6.75,48,48,0,0,0-2.25,5.31A4.21,4.21,0,0,1,13.14,38a1,1,0,0,1-.74.33.67.67,0,0,1-.77-.74,11.36,11.36,0,0,1,1-3.29,44.09,44.09,0,0,1,3-5.84C16.63,26.8,17.31,25.68,17.66,25.06Z' />
              <path d='M23.65,30a4.28,4.28,0,0,1,2.54,2.68.11.11,0,0,1,0,.12.13.13,0,0,1-.13.05L22,32.34a.15.15,0,0,1-.12-.08.12.12,0,0,1,0-.14L23.49,30A.13.13,0,0,1,23.65,30Zm-4.26.66A4.29,4.29,0,0,1,23,29.79a.14.14,0,0,1,.1.08.15.15,0,0,1,0,.13l-2.47,3.26a.13.13,0,0,1-.24,0l-1-2.44A.13.13,0,0,1,19.39,30.65Zm-1.56,4a4.32,4.32,0,0,1,1.05-3.54.12.12,0,0,1,.13,0,.11.11,0,0,1,.1.08l1.59,3.76a.16.16,0,0,1,0,.15.13.13,0,0,1-.12.06L18,34.79A.15.15,0,0,1,17.83,34.67ZM20.54,38A4.3,4.3,0,0,1,18,35.35a.13.13,0,0,1,0-.13.13.13,0,0,1,.12,0l4.06.5a.16.16,0,0,1,.12.07.14.14,0,0,1,0,.15L20.7,38A.14.14,0,0,1,20.54,38Zm4.26-.66a4.37,4.37,0,0,1-3.59.86.12.12,0,0,1-.1-.09.13.13,0,0,1,0-.13l2.46-3.26a.17.17,0,0,1,.13-.07.16.16,0,0,1,.12.09l1,2.44A.14.14,0,0,1,24.8,37.37Zm1.55-4a4.29,4.29,0,0,1-1.05,3.54.11.11,0,0,1-.12,0,.16.16,0,0,1-.1-.08l-1.59-3.77a.14.14,0,0,1,0-.14.12.12,0,0,1,.13-.06l2.62.35A.13.13,0,0,1,26.35,33.34Z' />
              <path d='M46.52,20.75,41.06,9.1h4.38l1.62,4.16c.48,1.36,1,2.61,1.47,4h.11c.52-1.41,1-2.66,1.54-4L51.79,9.1h4.28L50.61,20.75v6.47H46.52Z' />
              <path d='M56.33,20.33c0-4.59,3.23-7.24,6.72-7.24s6.72,2.65,6.72,7.24-3.23,7.22-6.72,7.22S56.33,24.9,56.33,20.33Zm9.25,0c0-2.39-.84-3.94-2.53-3.94s-2.53,1.55-2.53,3.94.84,3.92,2.53,3.92S65.58,22.71,65.58,20.33Z' />
              <path d='M73.43,22V13.42h4.09v8c0,2,.53,2.61,1.71,2.61a2.82,2.82,0,0,0,2.45-1.52V13.42h4.09v13.8H82.43l-.29-1.92H82a5.38,5.38,0,0,1-4.33,2.25C74.71,27.55,73.43,25.43,73.43,22Z' />
              <path d='M90.9,22.2V16.63H89v-3l2.11-.16.48-3.66H95v3.66H98.3v3.21H95v5.52c0,1.57.71,2.19,1.79,2.19a4.18,4.18,0,0,0,1.31-.26l.64,3a9.78,9.78,0,0,1-3.06.5C92.26,27.55,90.9,25.4,90.9,22.2Z' />
              <path d='M101.87,22V13.42H106v8c0,2,.54,2.61,1.72,2.61a2.83,2.83,0,0,0,2.45-1.52V13.42h4.09v13.8h-3.34l-.29-1.92h-.1a5.39,5.39,0,0,1-4.33,2.25C103.15,27.55,101.87,25.43,101.87,22Z' />
              <path d='M122.43,25.75h-.11L122,27.22h-3.19V7.74h4.08V12.5l-.1,2.12a5.6,5.6,0,0,1,3.65-1.53c3.34,0,5.41,2.76,5.41,7,0,4.76-2.82,7.47-5.8,7.47A5,5,0,0,1,122.43,25.75Zm5.21-5.6c0-2.48-.76-3.72-2.4-3.72a3.17,3.17,0,0,0-2.37,1.24v5.66a3.28,3.28,0,0,0,2.2.88C126.5,24.21,127.64,23,127.64,20.15Z' />
              <path d='M134.92,20.33c0-4.48,3.19-7.24,6.5-7.24,3.93,0,5.88,2.86,5.88,6.62a10,10,0,0,1-.17,1.81h-8.26a3.33,3.33,0,0,0,3.58,2.92,5.72,5.72,0,0,0,3-.91L146.79,26a9.07,9.07,0,0,1-4.9,1.55C138,27.55,134.92,24.89,134.92,20.33Zm8.88-1.52c0-1.51-.66-2.6-2.29-2.6a2.73,2.73,0,0,0-2.68,2.6Z' />
              <path d='M46.54,42l.08-1.15a2.85,2.85,0,0,1-1.89.83c-1.87,0-3.08-1.49-3.08-3.94s1.54-3.95,3.12-3.95a2.51,2.51,0,0,1,2,.93h.06L47,34h1.75V44.28H46.54Zm0-2.82V36.08a1.85,1.85,0,0,0-1.25-.48c-.72,0-1.35.67-1.35,2.1s.51,2.14,1.37,2.14A1.42,1.42,0,0,0,46.54,39.17Z' />
              <path d='M50.66,38.63V34h2.23v4.39c0,1.08.29,1.42.93,1.42s.9-.24,1.34-.83V34h2.23v7.53H55.57l-.16-1.05h-.06A2.92,2.92,0,0,1,53,41.67C51.36,41.67,50.66,40.51,50.66,38.63Z' />
              <path d='M59.17,31.7a1.3,1.3,0,1,1,1.29,1.16A1.19,1.19,0,0,1,59.17,31.7ZM59.34,34h2.23v7.53H59.34Z' />
              <path d='M63.09,37.73A3.79,3.79,0,0,1,67,33.78a3.27,3.27,0,0,1,2.2.81L68.15,36a1.54,1.54,0,0,0-1-.44c-1.07,0-1.76.84-1.76,2.15s.72,2.14,1.69,2.14a2.27,2.27,0,0,0,1.36-.55l.87,1.45a3.73,3.73,0,0,1-2.48.9A3.63,3.63,0,0,1,63.09,37.73Z' />
              <path d='M70.61,30.86h2.18V37h0l2.39-3h2.42L75,37.06l2.84,4.43H75.43l-1.69-2.94-.95,1.08v1.86H70.61Z' />
              <path d='M83.93,40.68h-.05l-.19.81H82V30.86h2.23v2.6l-.06,1.15a3.05,3.05,0,0,1,2-.83c1.83,0,3,1.51,3,3.81,0,2.6-1.53,4.08-3.16,4.08A2.73,2.73,0,0,1,83.93,40.68Zm2.85-3c0-1.35-.42-2-1.31-2a1.72,1.72,0,0,0-1.29.68v3.09a1.79,1.79,0,0,0,1.2.47C86.16,39.84,86.78,39.19,86.78,37.63Z' />
              <path d='M90.2,37.73a3.68,3.68,0,1,1,7.33,0,3.67,3.67,0,1,1-7.33,0Zm5,0c0-1.31-.45-2.15-1.38-2.15s-1.38.84-1.38,2.15.46,2.14,1.38,2.14S95.24,39,95.24,37.73Z' />
              <path d='M98.61,37.73a3.68,3.68,0,1,1,7.33,0,3.67,3.67,0,1,1-7.33,0Zm5,0c0-1.31-.46-2.15-1.38-2.15s-1.38.84-1.38,2.15.46,2.14,1.38,2.14S103.66,39,103.66,37.73Z' />
              <path d='M107.34,30.86h2.18V37h.06L112,34h2.42l-2.64,3.1,2.84,4.43h-2.42l-1.69-2.94-1,1.08v1.86h-2.18Z' />
              <path d='M115.65,34h1.82l.16,1h.06A3.15,3.15,0,0,1,120,33.78a2.09,2.09,0,0,1,2.08,1.27,3.26,3.26,0,0,1,2.36-1.27c1.62,0,2.35,1.15,2.35,3v4.67h-2.23V37.1c0-1.08-.29-1.42-.93-1.42a2,2,0,0,0-1.28.73v5.08h-2.23V37.1c0-1.08-.29-1.42-.93-1.42a2,2,0,0,0-1.28.73v5.08h-2.23Z' />
              <path d='M128.3,39.4c0-1.59,1.26-2.44,4.24-2.76a1,1,0,0,0-1.19-1.09,4.19,4.19,0,0,0-2,.68l-.79-1.46a6.16,6.16,0,0,1,3.21-1c1.92,0,3,1.1,3,3.41v4.3H133l-.16-.77h-.06a3.32,3.32,0,0,1-2.19,1A2.17,2.17,0,0,1,128.3,39.4Zm4.24-.1V38c-1.59.21-2.1.66-2.1,1.23s.33.73.86.73A1.7,1.7,0,0,0,132.54,39.3Z' />
              <path d='M136.64,34h1.82l.16,1.32h0a2.54,2.54,0,0,1,2.14-1.5,2.22,2.22,0,0,1,.9.15l-.37,1.93a3,3,0,0,0-.82-.12,1.86,1.86,0,0,0-1.65,1.39v4.36h-2.23Z' />
              <path d='M142.67,30.86h2.18V37h.06l2.38-3h2.42l-2.63,3.1,2.83,4.43H147.5l-1.69-2.94-1,1.08v1.86h-2.18Z' />
            </svg>
            {/* <img src='/logo-08.png' alt='youtube-quick-bookmark' /> */}
          </div>
          <div className='task my-4 flex justify-between items-center'>
            <div className='flex flex-row gap-2 justify-start items-center'>
              <button
                onClick={() => handleCapture('BOOKMARK')}
                className={`${data.length > 0 ? 'w-6' : 'w-7'} group opacity-90 rounded cursor-pointer`}
              >
                <svg
                  className='group-hover:fill-accent fill-background transition'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 36 36'
                >
                  <path d='M27.23,35.58a1.34,1.34,0,0,0,.87.28,1.17,1.17,0,0,0,.64-.16,1.41,1.41,0,0,0,.79-1.23V2.76A2.75,2.75,0,0,0,26.79.14H9.17a2.69,2.69,0,0,0-2.7,2.62V34.47a1.41,1.41,0,0,0,.79,1.23,1.47,1.47,0,0,0,1.51-.12c.08,0,.12-.12.2-.2l9-11.66L27,35.38C27.07,35.46,27.15,35.5,27.23,35.58Z' />
                </svg>
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className={`${data.length > 0 ? 'w-6' : 'w-7'} group opacity-90 rounded cursor-pointer`}
              >
                <svg
                  className='group-hover:fill-accent fill-background transition'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 36 36'
                >
                  <path d='M33.58,14.74h0a2.45,2.45,0,0,1-2.3-1.64c-.13-.35-.27-.7-.43-1a2.45,2.45,0,0,1,.46-2.79h0a2.43,2.43,0,0,0,0-3.43h0L30.14,4.67a2.43,2.43,0,0,0-3.43,0h0a2.48,2.48,0,0,1-2.8.45c-.33-.15-.68-.3-1-.43a2.44,2.44,0,0,1-1.62-2.27h0A2.43,2.43,0,0,0,18.83,0H17.17a2.44,2.44,0,0,0-2.43,2.42h0a2.45,2.45,0,0,1-1.64,2.3c-.35.13-.7.27-1,.43a2.45,2.45,0,0,1-2.79-.46h0a2.43,2.43,0,0,0-3.43,0h0L4.67,5.86a2.43,2.43,0,0,0,0,3.43h0a2.48,2.48,0,0,1,.45,2.8c-.15.33-.3.68-.43,1a2.44,2.44,0,0,1-2.27,1.62h0A2.43,2.43,0,0,0,0,17.17H0v1.66a2.44,2.44,0,0,0,2.42,2.43h0a2.45,2.45,0,0,1,2.3,1.64c.13.35.27.7.43,1a2.45,2.45,0,0,1-.46,2.79h0a2.43,2.43,0,0,0,0,3.43h0l1.17,1.17a2.43,2.43,0,0,0,3.43,0h0a2.48,2.48,0,0,1,2.8-.45c.33.15.68.3,1,.43a2.44,2.44,0,0,1,1.62,2.27h0A2.43,2.43,0,0,0,17.17,36h1.66a2.44,2.44,0,0,0,2.43-2.42h0a2.45,2.45,0,0,1,1.64-2.3c.35-.13.7-.27,1-.43a2.45,2.45,0,0,1,2.79.46h0a2.43,2.43,0,0,0,3.43,0h0l1.17-1.17a2.43,2.43,0,0,0,0-3.43h0a2.48,2.48,0,0,1-.45-2.8c.15-.33.3-.68.43-1a2.44,2.44,0,0,1,2.27-1.62h0A2.43,2.43,0,0,0,36,18.83h0V17.17a2.44,2.44,0,0,0-2.42-2.43ZM18,24a6,6,0,1,1,6-6h0A6,6,0,0,1,18,24Z' />
                </svg>
              </button>
              <div
                className={`${
                  modalOpen ? 'block' : 'hidden'
                } modal-overlay fixed z-10 bg-black bg-opacity-40 top-0 left-0 w-full h-full`}
              ></div>
              {modalOpen ? <SettingModal setModalOpen={setModalOpen}/> : null}
              {data.length > 0 ? (
                <button
                  onClick={handleClearStorageData}
                  className={`${data.length > 0 ? 'w-6' : 'w-7'} group opacity-90 rounded cursor-pointer`}
                >
                  <svg
                    className='group-hover:fill-accent fill-background transition'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 36 36'
                  >
                    <path d='M20.48,29.26,30.82,18.92,16,4.09,1.71,18.37a2.12,2.12,0,0,0,0,3L9.6,29.26Z' />
                    <path d='M34.06,30.91H1.94a2.08,2.08,0,0,0-1.49.63A2,2,0,0,0-.17,33a2.11,2.11,0,0,0,.62,1.49,2.07,2.07,0,0,0,1.49.62H34.06a2.08,2.08,0,0,0,1.45-.58l0,0a2.1,2.1,0,0,0,0-2.94l0,0A2.08,2.08,0,0,0,34.06,30.91Z' />
                    <path d='M32,17.76l2.3-2.31a2.12,2.12,0,0,0,0-3L22.46.62a2.12,2.12,0,0,0-3,0l-2.31,2.3L32,17.76Z' />
                  </svg>
                </button>
              ) : null}

              {data.length <= 0 ? (
                <button className=' w-6 opacity-90 rounded cursor-pointer'>
                  <svg
                    fill='#ffffff'
                    className='group-hover:fill-accent fill-background transition'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 36 36'
                  >
                    <path d='m31.89,33.39c1.94-2.78,1.27-6.6-1.51-8.54-1.21-.85-2.63-1.2-4-1.09h0c-2.06.16-4.19-.36-6.01-1.64-1.52-1.07-3.27-2.92-3.27-4.12s1.74-3.05,3.26-4.12c1.83-1.28,3.95-1.8,6.01-1.63h0c1.37.11,2.79-.24,4-1.09,2.77-1.94,3.45-5.77,1.51-8.54s-5.77-3.45-8.54-1.51c-1.21.85-2.03,2.06-2.39,3.39h0c-.55,1.99-1.77,3.81-3.59,5.09-1.97,1.38-4.3,1.88-6.51,1.58h0c-1.66-.23-3.41.15-4.9,1.19-3.12,2.19-3.88,6.49-1.7,9.61,1.54,2.19,4.12,3.22,6.6,2.88h0c2.21-.3,4.54.2,6.51,1.59,1.83,1.28,3.04,3.1,3.59,5.09h0c.37,1.33,1.18,2.54,2.39,3.39,2.77,1.94,6.6,1.27,8.54-1.51Z' />
                  </svg>
                </button>
              ) : null}
            </div>
            {data.length > 0 ? <SearchBar data={data} mapData={mapData} setData={setMapData} /> : null}
          </div>
        </div>
        <Toast message={toast} setMessage={setToast} />

        <section className='space-y-2'>
          {mapData.map((value: Item, key: number) => (
            <Card
              key={key}
              {...value}
              setData={setData}
              ref={(el) => (carRef.current[key] = el)}
              handleToggle={() => handleToggleAccordion(key)}
            />
          ))}
        </section>
      </div>
    </>
  )
}

export default App
