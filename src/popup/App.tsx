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
      if (!obj) return
      let currentItem = null
      if (tab.value) {
        const queryParameters = tab.value.url.split('?')[1]
        const urlParameters = new URLSearchParams(queryParameters)
        const vid = urlParameters.get('v')
        if (obj[vid]) {
          currentItem = obj[vid]
          delete obj[vid]
        }
      }
      const bookmarks: Item[] = Object.values(obj)
      if (currentItem) {
        currentItem.isExpand = true
        bookmarks.unshift(currentItem)
      }
      setData(bookmarks)
    }
    initData()
  }, [])

  const handleClearStorageData = async () => {
    //move the current data to the old data filed in order user can recover their data if unindent press clear data button
    const currentData = await chrome.storage.local.get(['data'])
    chrome.storage.local.set({ oldData: currentData.data })
    chrome.storage.local.set({ data: null })
    setData([])
  }

  const handleExtractText = () => {
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
      setToast('Visit the YouTube watch page to access bookmarks')
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
          <div
            className={data.length > 0 ? 'flex items-center justify-center mt-1' : 'flex items-center justify-start'}
          >
            <svg
              className={data.length > 0 ? 'w-[160px] fill-white' : 'w-[200px] fill-white'}
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 172.91 39.01'
            >
              <path d='M12.14,0h-10A2.17,2.17,0,0,0,0,2.17v10a1.75,1.75,0,0,0,3.5,0V3.5h8.64a1.75,1.75,0,0,0,0-3.5Z' />
              <path d='M36.66,0h-10a1.75,1.75,0,0,0,0,3.5h8.65v8.64a1.75,1.75,0,0,0,3.5,0v-10A2.17,2.17,0,0,0,36.66,0Z' />
              <path d='M37.08,25.12a1.75,1.75,0,0,0-1.75,1.75v8.64H26.68a1.75,1.75,0,0,0,0,3.5h10a2.17,2.17,0,0,0,2.17-2.17v-10A1.75,1.75,0,0,0,37.08,25.12Z' />
              <path d='M12.14,35.51H3.5V26.87a1.75,1.75,0,0,0-3.5,0v10A2.17,2.17,0,0,0,2.17,39h10a1.75,1.75,0,0,0,0-3.5Z' />
              <path d='M28.8,6.57a1.67,1.67,0,0,0-1.4-.77c-.68,0-1.35.44-2.22,1.47s-1.68,2.09-2.77,3.57-2.8,3.46-5,5.86a24.51,24.51,0,0,1-2.93,2.62,11,11,0,0,1-1.26.87A14.22,14.22,0,0,1,14.51,17a18.05,18.05,0,0,1,3.41-4.56,14.64,14.64,0,0,1,2.2-1.85,6.84,6.84,0,0,0,.95-.67,2,2,0,0,0,.67-1.53,1.72,1.72,0,0,0-.47-1.2,1.65,1.65,0,0,0-1.19-.5c-1.08,0-2.44.89-4.56,3a25.08,25.08,0,0,0-4.47,5.78A12.65,12.65,0,0,0,9.18,21.3a3.65,3.65,0,0,0,.38,1.63A2.62,2.62,0,0,0,12,24.51a4.1,4.1,0,0,0,2.43-.83c.18-.12.36-.26.54-.4a45.58,45.58,0,0,0-2,4.19c-1,2.45-1.15,3.32-1.15,3.81a1.69,1.69,0,0,0,1.8,1.77,2.06,2.06,0,0,0,1.48-.64,5,5,0,0,0,1-2A52.9,52.9,0,0,1,18.33,25a50.29,50.29,0,0,1,3.87-6.89c1-1.45,3.05-4.23,6.11-8.25a3.42,3.42,0,0,0,.86-2.06A2.05,2.05,0,0,0,28.8,6.57Z' />
              <path d='M26.09,24A5,5,0,0,1,29,27.08a.14.14,0,0,1,0,.14.15.15,0,0,1-.15.06l-4.71-.58a.19.19,0,0,1-.14-.09.2.2,0,0,1,0-.17L25.91,24A.14.14,0,0,1,26.09,24Zm-4.94.77a5,5,0,0,1,4.16-1,.18.18,0,0,1,.12.1.18.18,0,0,1,0,.16l-2.86,3.78a.19.19,0,0,1-.15.08.15.15,0,0,1-.13-.1L21.1,24.92A.14.14,0,0,1,21.15,24.74Zm-1.81,4.67a5,5,0,0,1,1.22-4.12.15.15,0,0,1,.26.05l1.85,4.37a.17.17,0,0,1,0,.17.14.14,0,0,1-.15.06l-3-.4A.15.15,0,0,1,19.34,29.41Zm3.14,3.89a5,5,0,0,1-2.95-3.11.14.14,0,0,1,0-.15A.15.15,0,0,1,19.7,30l4.71.58a.19.19,0,0,1,.14.09.15.15,0,0,1,0,.17l-1.87,2.42A.14.14,0,0,1,22.48,33.3Zm4.95-.77a5,5,0,0,1-4.17,1,.15.15,0,0,1-.12-.1.17.17,0,0,1,0-.15L26,29.5a.16.16,0,0,1,.14-.08.17.17,0,0,1,.14.1l1.17,2.83A.17.17,0,0,1,27.43,32.53Zm1.8-4.67A5,5,0,0,1,28,32a.12.12,0,0,1-.14.05.16.16,0,0,1-.12-.09l-1.84-4.37a.17.17,0,0,1,0-.17.17.17,0,0,1,.15-.07l3,.41A.15.15,0,0,1,29.23,27.86Z' />
              <path d='M61.05,17.32l1.9,1.9-2.52,2.52-2.11-2.11a10,10,0,0,1-4.55,1c-5.9,0-9.2-4.11-9.2-9.73s3.3-9.7,9.2-9.7S63,5.33,63,10.92A10.65,10.65,0,0,1,61.05,17.32Zm-5.75-.73L53,14.3l2.52-2.52,2.29,2.29a9.94,9.94,0,0,0,.46-3.15c0-3.22-1.14-5.87-4.52-5.87s-4.52,2.65-4.52,5.87,1.11,5.9,4.52,5.9A4.52,4.52,0,0,0,55.3,16.59Z' />
              <path d='M77.56,6.92V20.23H73.4V18.31h-.05A4.68,4.68,0,0,1,69,20.65c-2.57,0-4.32-1.69-4.32-4.74v-9h4.16v7.67c0,2,.71,2.68,2.08,2.68,1.59,0,2.5-.81,2.5-2.66V6.92Z' />
              <path d='M79.85,3.49a2.1,2.1,0,1,1,2.08,1.84A1.86,1.86,0,0,1,79.85,3.49ZM84,6.92V20.23H79.85V6.92Z' />
              <path d='M92.54,9.62c-1.72,0-2.68,1.46-2.68,4s.93,4,2.68,4a2.25,2.25,0,0,0,2.36-2.32H99c-.2,3.15-2.6,5.44-6.42,5.44-4.21,0-6.86-2.92-6.86-7.08S88.35,6.5,92.46,6.5c3.87,0,6.19,2.29,6.52,5.38H94.9A2.28,2.28,0,0,0,92.54,9.62Z' />
              <path d='M104.75,1.64v9.78l3.9-4.5h5l-4.7,5,5.25,8.32h-4.94l-3.15-5.3-1.33,1.37v3.93h-4.16V1.64Z' />
              <path d='M115.67,1.64h4.68l6.51,11h0v-11h4.68V20.23h-4.68l-6.5-11h-.06V20.23h-4.68Z' />
              <path d='M140.92,20.65c-4.45,0-7.12-2.94-7.12-7.08s2.67-7.07,7.12-7.07a6.67,6.67,0,0,1,7.1,7.07A6.67,6.67,0,0,1,140.92,20.65Zm0-3.12c1.82,0,2.94-1.38,2.94-4s-1.12-4-2.94-4-3,1.38-3,4S139.07,17.53,140.92,17.53Z' />
              <path d='M154.73,10v5.51c0,1.51.54,1.51,2.31,1.51v3.12a10.71,10.71,0,0,1-2.57.29c-3.05,0-3.9-1.62-3.9-4.61V10h-1.85V6.92h1.85V3.2h4.16V6.92H157V10Z' />
              <path d='M167.49,16.2h4.14c-.73,2.68-2.81,4.45-6.43,4.45-4.42,0-7.09-2.92-7.09-7.08S160.73,6.5,165,6.5c4.55,0,6.87,3.33,6.87,8.17h-9.57a2.74,2.74,0,0,0,2.86,2.86A2.29,2.29,0,0,0,167.49,16.2Zm-5.22-4.06h5.4a2.7,2.7,0,1,0-5.4,0Z' />
              <path d='M47.31,24.66,51,31h0l3.75-6.31h1.75l-4.7,7.6v5.28H50.25V32.26l-4.68-7.6Z' />
              <path d='M61.08,37.79c-2.81,0-4.5-2-4.5-4.84s1.69-4.85,4.5-4.85,4.49,2,4.49,4.85S63.87,37.79,61.08,37.79Zm0-1.26c2.06,0,3-1.62,3-3.58s-1-3.59-3-3.59S58,31,58,33,59,36.53,61.08,36.53Z' />
              <path d='M76,28.36v9.18H74.55v-1.1h0a3.65,3.65,0,0,1-3,1.35,2.82,2.82,0,0,1-3.08-3V28.36h1.44v6a1.87,1.87,0,0,0,2,2.12,2.47,2.47,0,0,0,2.7-2.45V28.36Z' />
              <path d='M83.1,26.1H78.81V24.66H89V26.1H84.72V37.54H83.1Z' />
              <path d='M97.91,28.36v9.18H96.47v-1.1h0a3.66,3.66,0,0,1-3,1.35,2.82,2.82,0,0,1-3.08-3V28.36h1.44v6a1.87,1.87,0,0,0,2,2.12,2.47,2.47,0,0,0,2.7-2.45V28.36Z' />
              <path d='M109.83,33c0,3-1.84,4.84-4.14,4.84a3.4,3.4,0,0,1-2.88-1.39h0v1.14h-1.44V24.66h1.44v4.88h0a3.24,3.24,0,0,1,2.88-1.44C108,28.1,109.83,29.92,109.83,33Zm-1.44,0c0-1.8-1-3.59-2.85-3.59-1.71,0-2.77,1.43-2.77,3.59s1.06,3.58,2.77,3.58C107.43,36.53,108.39,34.75,108.39,33Z' />
              <path d='M119.31,34.71h1.44a4,4,0,0,1-4.07,3.08c-2.79,0-4.48-2-4.48-4.84,0-3.06,1.73-4.85,4.41-4.85,2.88,0,4.29,2,4.29,5.22h-7.26a3,3,0,0,0,3,3.21A2.55,2.55,0,0,0,119.31,34.71Zm-5.67-2.65h5.82a2.7,2.7,0,0,0-2.85-2.7A2.8,2.8,0,0,0,113.64,32.06Z' />
              <path d='M129,24.66h5.12c2.36,0,4.17,1.05,4.17,3.75s-1.81,3.74-4.17,3.74h-3.5v5.39H129Zm1.62,6.05h3.68c1.6,0,2.37-.73,2.37-2.3s-.77-2.31-2.37-2.31h-3.68Z' />
              <path d='M146,28.16V29.6h0a2.84,2.84,0,0,0-3.39,3v4.9h-1.44V28.36h1.44v1.81h0a2.72,2.72,0,0,1,2.54-2.07A5.08,5.08,0,0,1,146,28.16Z' />
              <path d='M152.32,37.79c-2.8,0-4.5-2-4.5-4.84s1.7-4.85,4.5-4.85,4.49,2,4.49,4.85S155.12,37.79,152.32,37.79Zm0-1.26c2.06,0,3.05-1.62,3.05-3.58s-1-3.59-3.05-3.59S149.26,31,149.26,33,150.25,36.53,152.32,36.53Z' />
            </svg>
            {/* <img src='/logo-08.png' alt='youtube-quick-bookmark' /> */}
          </div>
          <div
            className={`task ${data.length > 0 ? 'mt-5 mb-4' : 'my-4  ml-[-3px]'} flex justify-between items-center`}
          >
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
              {modalOpen ? <SettingModal setModalOpen={setModalOpen} setData={setData} setMessage={setToast} /> : null}
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
