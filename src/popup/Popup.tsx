import { useState, useEffect } from 'react'
import Card from '../components/card.tsx'
import { Item } from '../Interface/index.ts'
import './index.css'

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

  async function getCurrentTab() {
    const queryOptions = { active: true, currentWindow: true }
    const [tab] = await chrome.tabs.query(queryOptions)
    return tab
  }

  const handleCapture = async () => {
    const tab = await getCurrentTab()

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: handleScreenShot,
    })
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
          content={[{ index: '01234', timeStamp: 'timeStamp', desc: 'hello description' }]}
          url='https://www.youtube.com/watch?v=erEgovG9WBs'
        />
        <Card
          title='100+ Web Development Things you Should Know'
          content={[{ index: '01234', timeStamp: 'timeStamp', desc: 'hello description' }]}
          url='https://www.youtube.com/watch?v=erEgovG9WBs'
        />
        <Card
          title='100+ Web Development Things you Should Know'
          content={[{ index: '01234', timeStamp: 'timeStamp', desc: 'hello description' }]}
          url='https://www.youtube.com/watch?v=erEgovG9WBs'
        />
      </section>
    </div>
  )
}

export default App
