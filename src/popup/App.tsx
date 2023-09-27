import { useState, useEffect } from 'react'
import Card from '../components/card.tsx'
import Toast from '../components/toast.tsx'
import { getCurrentTab, fetchBookmarks } from '../../utils/index.ts'
import { Item } from '../Interface/index.ts'
import './index.css'

function App() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>([])
  const [toast, setToast] = useState()
  // handle load data from chrome storage
  useEffect(() => {
    const initData = async () => {
      const result = await Promise.allSettled([fetchBookmarks(), getCurrentTab()])
      const [storageData, tab] = result
      const obj = storageData.value
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

  const handleCapture = async (type: string) => {
    const tab = await getCurrentTab()
    chrome.tabs.sendMessage(tab.id!, { type, tab: JSON.stringify(tab) }, (response) => {
      console.log(response)
      if (!response || response.status == 'fail') {
        setToast(response.message)
        return
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

  return (
    <>
      <div className='blur-bg'></div>
      <div className='p-3 app dark h-full'>
        <div
          className={
            data.length > 0
              ? 'relative top-0  transition-all ease-in-out'
              : 'relative left-1/2 top-1/2 transition-all ease-in-out translate-y-[-50%] translate-x-[-50%]'
          }
        >
          <div className={data.length > 0 ? 'flex items-center justify-center' : 'flex items-center justify-start'}>
            <img src='/logo-08.png' alt='youtube-quick-bookmark' width={data.length > 0 ? 130 : 180} />
          </div>
          <div className='task my-4'>
            <div className='flex flex-row gap-3 justify-start items-center'>
              <button onClick={() => handleCapture('BOOKMARK')} className='w-6 opacity-90 rounded cursor-pointer'>
                <svg fill='#ffffff' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'>
                  <path d='M27.23,35.58a1.34,1.34,0,0,0,.87.28,1.17,1.17,0,0,0,.64-.16,1.41,1.41,0,0,0,.79-1.23V2.76A2.75,2.75,0,0,0,26.79.14H9.17a2.69,2.69,0,0,0-2.7,2.62V34.47a1.41,1.41,0,0,0,.79,1.23,1.47,1.47,0,0,0,1.51-.12c.08,0,.12-.12.2-.2l9-11.66L27,35.38C27.07,35.46,27.15,35.5,27.23,35.58Z' />
                </svg>
              </button>
              <button onClick={() => handleCapture('EXTRACT')} className='w-6 opacity-90 rounded cursor-pointer'>
                <svg fill='#ffffff' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'>
                  <path d='M24.49,1.21A18,18,0,0,1,35.11,12.4a.56.56,0,0,1-.1.53.54.54,0,0,1-.51.2L17.56,11a.6.6,0,0,1-.5-.32.55.55,0,0,1,.06-.59l6.72-8.73A.56.56,0,0,1,24.49,1.21ZM6.71,4a18.06,18.06,0,0,1,15-3.6.58.58,0,0,1,.42.36.59.59,0,0,1-.09.54L11.74,14.89a.61.61,0,0,1-.53.29.57.57,0,0,1-.48-.35L6.53,4.64A.56.56,0,0,1,6.71,4ZM.21,20.78A18,18,0,0,1,4.6,6a.54.54,0,0,1,.51-.18.52.52,0,0,1,.42.34l6.64,15.72a.57.57,0,0,1,0,.6.54.54,0,0,1-.53.24L.7,21.25A.56.56,0,0,1,.21,20.78Zm11.3,14A18,18,0,0,1,.89,23.6a.57.57,0,0,1,.1-.53.56.56,0,0,1,.51-.19L18.44,25a.6.6,0,0,1,.5.31.57.57,0,0,1-.06.6l-6.72,8.72A.53.53,0,0,1,11.51,34.79ZM29.29,32a18,18,0,0,1-15,3.59.56.56,0,0,1-.42-.34.61.61,0,0,1,.09-.55L24.26,21.1a.61.61,0,0,1,.53-.27.55.55,0,0,1,.48.35l4.2,10.18A.56.56,0,0,1,29.29,32Zm6.5-16.79A18,18,0,0,1,31.4,30a.53.53,0,0,1-.51.19.58.58,0,0,1-.42-.34L23.83,14.13a.57.57,0,0,1,0-.59.53.53,0,0,1,.54-.25L35.3,14.76A.54.54,0,0,1,35.79,15.23Z' />
                </svg>
              </button>
              {data.length > 0 ? (
                <button onClick={handleClearStorageData} className=' w-6 opacity-90 rounded cursor-pointer'>
                  <svg fill='#ffffff' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'>
                    <path d='M20.48,29.26,30.82,18.92,16,4.09,1.71,18.37a2.12,2.12,0,0,0,0,3L9.6,29.26Z' />
                    <path d='M34.06,30.91H1.94a2.08,2.08,0,0,0-1.49.63A2,2,0,0,0-.17,33a2.11,2.11,0,0,0,.62,1.49,2.07,2.07,0,0,0,1.49.62H34.06a2.08,2.08,0,0,0,1.45-.58l0,0a2.1,2.1,0,0,0,0-2.94l0,0A2.08,2.08,0,0,0,34.06,30.91Z' />
                    <path d='M32,17.76l2.3-2.31a2.12,2.12,0,0,0,0-3L22.46.62a2.12,2.12,0,0,0-3,0l-2.31,2.3L32,17.76Z' />
                  </svg>
                </button>
              ) : null}

              {data.length <= 0 ? (
                <button className=' w-6 opacity-90 rounded cursor-pointer'>
                  <svg fill='#ffffff' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'>
                    <path d='m31.89,33.39c1.94-2.78,1.27-6.6-1.51-8.54-1.21-.85-2.63-1.2-4-1.09h0c-2.06.16-4.19-.36-6.01-1.64-1.52-1.07-3.27-2.92-3.27-4.12s1.74-3.05,3.26-4.12c1.83-1.28,3.95-1.8,6.01-1.63h0c1.37.11,2.79-.24,4-1.09,2.77-1.94,3.45-5.77,1.51-8.54s-5.77-3.45-8.54-1.51c-1.21.85-2.03,2.06-2.39,3.39h0c-.55,1.99-1.77,3.81-3.59,5.09-1.97,1.38-4.3,1.88-6.51,1.58h0c-1.66-.23-3.41.15-4.9,1.19-3.12,2.19-3.88,6.49-1.7,9.61,1.54,2.19,4.12,3.22,6.6,2.88h0c2.21-.3,4.54.2,6.51,1.59,1.83,1.28,3.04,3.1,3.59,5.09h0c.37,1.33,1.18,2.54,2.39,3.39,2.77,1.94,6.6,1.27,8.54-1.51Z' />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>
        </div>
        {toast ? <Toast message={toast} setMessage={setToast} /> : null}
        <section className='space-y-2'>
          {data.map((value: Item, key: number) => (
            <Card key={key} {...value} setData={setData} />
          ))}
        </section>
      </div>
    </>
  )
}

export default App
