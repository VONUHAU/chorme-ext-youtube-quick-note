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
      let bookmarks = await fetchBookmarks()
      bookmarks = Object.values(bookmarks)
      console.log(bookmarks)
      bookmarks = bookmarks.sort((a: Item, b: Item) => new Date(b.createdAt) - new Date(a.createdAt))
      setData(bookmarks)
    }
    initData()
  }, [])

  const handleClearStorageData = () => {
    chrome.storage.local.clear(() => {
      console.log('cleared all')
    })
  }

  const handleCapture = async () => {
    const tab = await getCurrentTab()
    const response = await chrome.tabs.sendMessage(tab.id!, { type: 'CAPTURE', tab: JSON.stringify(tab) })
    console.log(response)
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
          <button
            onClick={handleClearStorageData}
            className='bg-slate-700 dark:bg-primary text-white rounded cursor-pointer'
          >
            {' '}
            Remove All
          </button>
        </div>
      </section>
      <section className='space-y-3'>
        {data.map((value: Item, key: number) => (
          <Card key={key} {...value} />
        ))}
      </section>
    </div>
  )
}

export default App
