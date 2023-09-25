import { useState, useEffect } from 'react'
import Card from '../components/card.tsx'
import { getCurrentTab, fetchBookmarks } from '../../utils'
import './index.css'
import { Item } from '../Interface/index.ts'

function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>([])
  // handle load data from chrome storage
  useEffect(() => {
    const initData = async () => {
      const result = await Promise.allSettled([fetchBookmarks(), getCurrentTab()])
      const [storageData, tab] = result
      const obj = storageData.value
      console.log(obj)
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
      let bookmarks: Item[] = Object.values(obj)
      bookmarks = bookmarks.sort((a: Item, b: Item) => new Date(b.createdAt) - new Date(a.createdAt))
      currentItem && bookmarks.unshift(currentItem)
      setData(bookmarks)
    }
    initData()
  }, [])

  const handleClearStorageData = () => {
    chrome.storage.local.clear(() => {
      console.log('cleared all')
    })
  }

  const handleCapture = async (type: string) => {
    const tab = await getCurrentTab()
    chrome.tabs.sendMessage(tab.id!, { type, tab: JSON.stringify(tab) }, (response) => {
      if (!response) return
      response = Object.values(response)
      response = response.sort((a: Item, b: Item) => new Date(b.createdAt) - new Date(a.createdAt))
      setData(response)
    })
  }

  return (
    <>
      <div className='blur-bg'></div>
      <div className='p-3 app dark'>
        <div className='flex items-center justify-center mb-3'>
          <img src='/logo-08.png' alt='youtube-quick-bookmark' width={130} />
        </div>

        <section className='task mb-3'>
          <div className='flex flex-row gap-3 justify-start items-center'>
            <button onClick={() => handleCapture('BOOKMARK')} className=' w-7 opacity-90 rounded cursor-pointer'>
              <svg fill='#ffffff' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'>
                <path d='M27.23,35.58a1.34,1.34,0,0,0,.87.28,1.17,1.17,0,0,0,.64-.16,1.41,1.41,0,0,0,.79-1.23V2.76A2.75,2.75,0,0,0,26.79.14H9.17a2.69,2.69,0,0,0-2.7,2.62V34.47a1.41,1.41,0,0,0,.79,1.23,1.47,1.47,0,0,0,1.51-.12c.08,0,.12-.12.2-.2l9-11.66L27,35.38C27.07,35.46,27.15,35.5,27.23,35.58Z' />
              </svg>
            </button>
            <button onClick={() => handleCapture('EXTRACT')} className=' w-7 opacity-90 rounded cursor-pointer'>
              <svg fill='#ffffff' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'>
                <path d='M24.49,1.21A18,18,0,0,1,35.11,12.4a.56.56,0,0,1-.1.53.54.54,0,0,1-.51.2L17.56,11a.6.6,0,0,1-.5-.32.55.55,0,0,1,.06-.59l6.72-8.73A.56.56,0,0,1,24.49,1.21ZM6.71,4a18.06,18.06,0,0,1,15-3.6.58.58,0,0,1,.42.36.59.59,0,0,1-.09.54L11.74,14.89a.61.61,0,0,1-.53.29.57.57,0,0,1-.48-.35L6.53,4.64A.56.56,0,0,1,6.71,4ZM.21,20.78A18,18,0,0,1,4.6,6a.54.54,0,0,1,.51-.18.52.52,0,0,1,.42.34l6.64,15.72a.57.57,0,0,1,0,.6.54.54,0,0,1-.53.24L.7,21.25A.56.56,0,0,1,.21,20.78Zm11.3,14A18,18,0,0,1,.89,23.6a.57.57,0,0,1,.1-.53.56.56,0,0,1,.51-.19L18.44,25a.6.6,0,0,1,.5.31.57.57,0,0,1-.06.6l-6.72,8.72A.53.53,0,0,1,11.51,34.79ZM29.29,32a18,18,0,0,1-15,3.59.56.56,0,0,1-.42-.34.61.61,0,0,1,.09-.55L24.26,21.1a.61.61,0,0,1,.53-.27.55.55,0,0,1,.48.35l4.2,10.18A.56.56,0,0,1,29.29,32Zm6.5-16.79A18,18,0,0,1,31.4,30a.53.53,0,0,1-.51.19.58.58,0,0,1-.42-.34L23.83,14.13a.57.57,0,0,1,0-.59.53.53,0,0,1,.54-.25L35.3,14.76A.54.54,0,0,1,35.79,15.23Z' />
              </svg>
            </button>
            <button onClick={handleClearStorageData} className=' w-7 opacity-90 rounded cursor-pointer'>
              <svg fill='#ffffff' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'>
                <path d='M20.48,29.26,30.82,18.92,16,4.09,1.71,18.37a2.12,2.12,0,0,0,0,3L9.6,29.26Z' />
                <path d='M34.06,30.91H1.94a2.08,2.08,0,0,0-1.49.63A2,2,0,0,0-.17,33a2.11,2.11,0,0,0,.62,1.49,2.07,2.07,0,0,0,1.49.62H34.06a2.08,2.08,0,0,0,1.45-.58l0,0a2.1,2.1,0,0,0,0-2.94l0,0A2.08,2.08,0,0,0,34.06,30.91Z' />
                <path d='M32,17.76l2.3-2.31a2.12,2.12,0,0,0,0-3L22.46.62a2.12,2.12,0,0,0-3,0l-2.31,2.3L32,17.76Z' />
              </svg>
            </button>
          </div>
        </section>
        <section className='space-y-3'>
          {data.map((value: Item, key: number) => (
            <Card key={key} {...value} setData={setData} />
          ))}
        </section>
      </div>
    </>
  )
}

export default App
