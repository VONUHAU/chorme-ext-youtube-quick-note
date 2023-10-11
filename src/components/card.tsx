/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction, useEffect, useState, forwardRef, useRef } from 'react'
import { getCurrentTab, fetchBookmarks, transformObj2Arr } from '../../utils'
import { Item } from '../Interface'
import { Note } from './note'
export type HTMLMouseEvent = React.MouseEvent<HTMLElement>
interface Card extends Item {
  setData: Dispatch<SetStateAction<any[]>>
  handleToggle: () => void
}
type Ref = HTMLDivElement
export const Card = forwardRef<Ref, Card>(
  ({ title, notes, url, vid, isExpand, newCreated, setData, handleToggle }, ref) => {
    const [accordion, setAccordion] = useState(false)

    useEffect(() => {
      setAccordion(isExpand)
    }, [isExpand])

    const handleRemoveCard = async (e: HTMLMouseEvent) => {
      e.stopPropagation()
      const tab = await getCurrentTab()
      const bookmarks = await fetchBookmarks()
      delete bookmarks[vid]
      const newArr = transformObj2Arr(bookmarks, vid)
      setData(newArr)
      chrome.storage.local.set({ data: JSON.stringify(bookmarks) })
      await chrome.tabs.sendMessage(tab.id, {
        type: 'REMOVE_ALL_BOOKMARK'
      })
    }

    const handleOpenNewTab = async () => {
      const tab = await getCurrentTab()
      if (accordion) {
        chrome.tabs.sendMessage(tab.id!, {
          type: 'OPEN_NEW_TAB',
          url
        })
      } else {
        setAccordion(true)
      }
    }

    return (
      <div ref={ref} onClick={handleToggle} className='card rounded-md bg-background_rgba p-3'>
        <div className='mb-2.5'>
          <h4 className={`title cursor-default inline font-medium transition-all duration-75 ease-in-out`}>
            {title}
            {
              <svg
                className={`peer inline ml-2 w-4 h-4 fill-background cursor-pointer transition-all duration-75 ease-in-out hover:fill-accent`}
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 36 36'
                onClick={handleOpenNewTab}
              >
                <path d='m35.09.91c-.59-.59-1.36-.91-2.18-.91-.38,0-.76.07-1.13.22L2.02,12.04C.83,12.48.03,13.65.03,14.95s.81,2.43,2.02,2.87l11.8,4.36,4.36,11.8c.43,1.16,1.53,1.95,2.87,2.02h.03c1.3,0,2.43-.78,2.86-1.96l11.81-29.84c.43-1.1.18-2.35-.69-3.29Zm-13.9,23.37l-2.07-5.6c-.33-.86-1-1.52-1.82-1.81l-5.59-2.07,15.71-6.22-6.23,15.7Z' />
              </svg>
            }
          </h4>
        </div>
        <div className={`card-detail space-y-2 ${accordion && 'card-open'} `}>
          {notes.map((value, key) => (
            <Note
              vid={vid}
              url={url!}
              index={key}
              value={value}
              notes={notes}
              newCreated={newCreated}
              setData={setData}
            />
          ))}
        </div>
        <div className='flex justify-end mt-2'>
          <button
            className='w-4 h-1 relative cursor-pointer after:bg-background before:bg-background after:transition-all before:opacity-90 after:opacity-90 before:transition-all after:ease-in-out
          before:ease-in-out hover:before:rotate-45 hover:after:rotate-[-45deg] after:content-[""] after:absolute after:inset-0 before:inset-0 after:rounded-full
          before:rounded-full after:w-full after:h-full before:content-[""] before:absolute before:w-full before:h-full'
            onClick={(e) => handleRemoveCard(e)}
          ></button>
        </div>
      </div>
    )
  }
)
