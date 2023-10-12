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
      chrome.tabs.sendMessage(tab.id!, {
        type: 'OPEN_NEW_TAB',
        url
      })
    }

    return (
      <div ref={ref} onClick={handleToggle} className='card rounded-md bg-background_rgba p-3'>
        <div className='mb-2.5'>
          <h4 className={`title cursor-default inline font-medium transition-all duration-75 ease-in-out`}>
            {title}
            {
              <svg
                className={`peer -translate-y-px inline ml-2 w-4 h-4 fill-background cursor-pointer transition-all duration-75 ease-in-out hover:fill-accent`}
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 36 36'
                onClick={handleOpenNewTab}
              >
                <path d='M34.41.58a1.8,1.8,0,0,1,1,2.34L22.83,34.42a1.81,1.81,0,0,1-1.67,1.13H21a1.8,1.8,0,0,1-1.62-1.35L16,20.05,1.84,16.62l0,0A1.82,1.82,0,0,1,.58,15.5a1.79,1.79,0,0,1,1-2.33L33.08.58A1.8,1.8,0,0,1,34.41.58Z' />
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
