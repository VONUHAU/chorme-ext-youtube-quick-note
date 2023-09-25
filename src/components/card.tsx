import { Dispatch, SetStateAction, useState } from 'react'
import { getCurrentTab, formatTimeStamp, fetchBookmarks } from '../../utils'
import { Item } from '../Interface'
import { TextEditor } from './textEditor'

interface Card extends Item {
  setData: Dispatch<SetStateAction<string>>
}
export default function Card({ title, notes, url, vid, setData }: Card) {
  const [isAddTextEditor, setAddTextEditor] = useState([...new Array(notes.length)].map((_value) => true))
  const handlePlayAtTime = async (time: number) => {
    const tab = await getCurrentTab()
    console.log(vid)
    const response = await chrome.tabs.sendMessage(tab.id!, {
      type: 'PLAY',
      time,
      url,
      vid
    })
  }

  const handleRemoveCard = async () => {
    const bookmarks = await fetchBookmarks()
    delete bookmarks[vid]
    chrome.storage.local.set({ data: JSON.stringify(bookmarks) })
  }
  const handleRemoveTimeStamp = async (index: number) => {
    const bookmarks = await fetchBookmarks()
    const currentBookmark = bookmarks[vid]
    currentBookmark.notes.splice(index, 1)
    delete bookmarks[vid]
    bookmarks[vid] = currentBookmark
    setData(bookmarks)
    chrome.storage.local.set({ data: JSON.stringify(bookmarks) })
  }

  const handleShowEditor = (index: number) => {
    setAddTextEditor((pre) => {
      pre[index] = true
      setData(pre)
      return pre
    })
  }
  const handleOpenNewTab = async () => {
    const tab = await getCurrentTab()
    chrome.tabs.sendMessage(tab.id!, {
      type: 'OPEN_NEW_TAB',
      url
    })
  }

  return (
    <div className='card rounded-md bg-background_rgba p-3'>
      <div onClick={handleOpenNewTab} className='cursor-pointer text-background'>
        {' '}
        <h4 className='mb-2.5'> {title} </h4>
      </div>
      <div className='contents space-y-2'>
        {notes.map((value, key) => (
          <div className='bookmark rounded p-2' key={key}>
            <div
              className='timestamp flex gap-2 mb-1 font-medium text-background italic cursor-pointer'
              onClick={() => handlePlayAtTime(value.timeStamp)}
            >
              <svg width={16} height={16} fill='#ffffff' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'>
                <path d='M18,0A18,18,0,1,0,36,18,18,18,0,0,0,18,0Zm0,32.4A14.4,14.4,0,1,1,32.4,18,14.4,14.4,0,0,1,18,32.4Z' />
                <path d='M23.4,17.4H18.6v-6a1.8,1.8,0,0,0-3.6,0v6A3.6,3.6,0,0,0,18.6,21h4.8a1.8,1.8,0,0,0,0-3.6Z' />
              </svg>
              {formatTimeStamp(value.timeStamp)}
            </div>
            {value.desc || isAddTextEditor[key] ? <TextEditor index={key} vid={vid} content={value.desc} /> : null}

            <div className='flex gap-1.5 mt-1.5 justify-end items-center'>
              <button className=' w-3 opacity-90 rounded cursor-pointer' onClick={() => handleShowEditor(key)}>
                <svg fill='white' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'>
                  <path d='M21.42,18,35.29,4.13A2.42,2.42,0,0,0,31.87.71L18,14.58,4.13.71A2.42,2.42,0,0,0,.71,4.13L14.58,18,.71,31.87a2.42,2.42,0,1,0,3.42,3.42L18,21.42,31.87,35.29a2.42,2.42,0,0,0,3.42-3.42Z' />
                </svg>
              </button>
              <button className=' w-3 opacity-90 rounded cursor-pointer' onClick={() => handleRemoveTimeStamp(key)}>
                <svg fill='white' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'>
                  <path d='M21.42,18,35.29,4.13A2.42,2.42,0,0,0,31.87.71L18,14.58,4.13.71A2.42,2.42,0,0,0,.71,4.13L14.58,18,.71,31.87a2.42,2.42,0,1,0,3.42,3.42L18,21.42,31.87,35.29a2.42,2.42,0,0,0,3.42-3.42Z' />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className='flex justify-end mt-3'>
        <button className=' w-3 opacity-90 rounded cursor-pointer' onClick={handleRemoveCard}>
          <svg fill='white' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'>
            <path d='M21.42,18,35.29,4.13A2.42,2.42,0,0,0,31.87.71L18,14.58,4.13.71A2.42,2.42,0,0,0,.71,4.13L14.58,18,.71,31.87a2.42,2.42,0,1,0,3.42,3.42L18,21.42,31.87,35.29a2.42,2.42,0,0,0,3.42-3.42Z' />
          </svg>
        </button>
      </div>
    </div>
  )
}
