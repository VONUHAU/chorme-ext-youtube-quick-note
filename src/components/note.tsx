/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { getCurrentTab, formatTimeStamp, fetchBookmarks, transformObj2Arr } from '../../utils'
import { TextEditor } from './textEditor'

export type HTMLMouseEvent = React.MouseEvent<HTMLElement>
type Note = {
  index: number
  newCreated: boolean
  vid: string
  url: string
  notes: []
  value: {
    desc: string
    timeStamp: number
  }
  setData: Dispatch<SetStateAction<any[]>>
  setMessage: Dispatch<SetStateAction<string>>
}
export const Note: React.FC<Note> = ({ newCreated, vid, url, notes, value, setData, setMessage, index }) => {
  const { desc, timeStamp } = value
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    if (desc || (newCreated && index == 0)) {
      setShowEditor(true)
    }
  }, [newCreated, index])

  const handleRemoveTimeStamp = async (e: HTMLMouseEvent) => {
    e.stopPropagation()
    const bookmarks = await fetchBookmarks()
    const adjustBookMark = bookmarks[vid]
    adjustBookMark.notes.splice(index, 1)
    const clone = JSON.parse(JSON.stringify(bookmarks))
    clone[vid].isExpand = true
    const newArr = transformObj2Arr(clone, vid)
    setData(newArr)
    chrome.storage.local.set({ data: JSON.stringify(bookmarks) })
    const tab = await getCurrentTab()
    await chrome.tabs.sendMessage(tab.id!, {
      type: 'REMOVE_BOOKMARK',
      time: timeStamp
    })
  }

  const handleShowEditor = (e: HTMLMouseEvent) => {
    e.stopPropagation()
    setShowEditor(!showEditor)
  }

  const handlePlayAtTime = async (e: HTMLMouseEvent, time: number) => {
    e.stopPropagation()
    const tab = await getCurrentTab()
    await chrome.tabs.sendMessage(tab.id!, {
      type: 'PLAY_AT_TIME',
      time,
      url,
      vid
    })
  }
  const handleTogglePlay = async (e: HTMLMouseEvent) => {
    e.stopPropagation()
    const tab = await getCurrentTab()
    if (!tab?.url?.includes('youtube.com/watch')) {
      setMessage("Can't detect YouTube watch page")
      return
    }
    chrome.tabs.sendMessage(tab.id!, {
      type: 'TOGGLE_PLAY'
    })
  }

  const handleSkip = async (e: HTMLMouseEvent, type: string) => {
    e.stopPropagation()
    const tab = await getCurrentTab()
    if (!tab?.url?.includes('youtube.com/watch')) {
      setMessage("Can't detect YouTube watch page")
      return
    }
    let value = 0
    if (e.shiftKey) {
      if (type == 'NEXT') {
        value += 20
      } else {
        value -= 20
      }
    } else if (e.ctrlKey) {
      if (type == 'NEXT') {
        value += 10
      } else {
        value -= 10
      }
    } else {
      if (type == 'NEXT') {
        value += 5
      } else {
        value -= 5
      }
    }
    chrome.tabs.sendMessage(tab.id!, {
      type: 'SKIP_TIMESTAMP',
      vid,
      value
    })
  }

  return (
    <div className='bookmark rounded p-2'>
      <div className='timestamp flex gap-2 mb-2 hover:text-accent font-medium text-background italic'>
        <svg
          width={16}
          height={16}
          className='timer-icon fill-white'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 36 36'
        >
          <path d='M18,0A18,18,0,1,0,36,18,18,18,0,0,0,18,0Zm0,32.4A14.4,14.4,0,1,1,32.4,18,14.4,14.4,0,0,1,18,32.4Z' />
          <path d='M23.4,17.4H18.6v-6a1.8,1.8,0,0,0-3.6,0v6A3.6,3.6,0,0,0,18.6,21h4.8a1.8,1.8,0,0,0,0-3.6Z' />
        </svg>
        <span
          className='timer hover:fill-accent transition-all duration-75 ease-in-out cursor-pointer'
          onClick={(e) => handlePlayAtTime(e, timeStamp)}
        >
          {formatTimeStamp(timeStamp)}
        </span>
      </div>
      {showEditor ? <TextEditor index={index} vid={vid} notes={notes} time={timeStamp} /> : null}

      <div className='flex gap-1.5 mt-1.5 justify-between items-center'>
        <div className='flex gap-1.5 justify-end items-center'>
          <button className='group w-3 opacity-60 rounded cursor-pointer' onClick={(e) => handleSkip(e, 'PREVIOUS')}>
            <svg
              width={14}
              height={14}
              className='group-hover:fill-accent fill-white '
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 36 36'
            >
              <path d='M36,14.2l-.08-1C35,4.55,31.45,1,22.83.21l-2-.16h-4L15.74.1H15.2l-1.06,0-1,.08C4.55,1,1,4.55.21,13.17l-.16,2v4l.05,1.1v.54l.16,2c.82,8.62,4.34,12.14,13,13l1,.08.94.15h5.6l1-.08,1-.08c8.62-.82,12.14-4.34,13-13l.08-1,0-1v-4l.07-1.1V15.2ZM17.79,25.9a2,2,0,0,1-2.86,0L8.46,19.43A2,2,0,0,1,7.86,18a2.06,2.06,0,0,1,.6-1.43l6.47-6.47a2,2,0,0,1,1.43-.59,2.12,2.12,0,0,1,1.43.59,2,2,0,0,1,0,2.86l-5,5,5,5A2,2,0,0,1,17.79,25.9ZM27.54,23a2,2,0,0,1-2.86,2.86l-6.46-6.47a2,2,0,0,1-.6-1.43,2,2,0,0,1,.6-1.43l6.46-6.47A2,2,0,0,1,27.54,13l-5,5Z' />
            </svg>
          </button>
          <button className='group w-3 opacity-60 rounded cursor-pointer' onClick={(e) => handleTogglePlay(e)}>
            <svg
              width={14}
              height={14}
              className='group-hover:fill-accent fill-white '
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 36 36'
            >
              <path d='M36,15.72c0-.18,0-.36,0-.54l-.06-1-.08-1C35,4.53,31.47,1,22.85.18l-1-.08-1-.06-.54,0L19.16,0H18V0H16.86L15.74,0l-.53,0L14.16.12l-1,.08C4.55,1,1,4.55.18,13.16l-.07,1-.06,1,0,.54,0,1.12V18c0,.39,0,.78,0,1.15l0,1.11c0,.18,0,.36,0,.54l.06,1,.08,1C1,31.47,4.55,35,13.15,35.81l1,.08,1,.06.54,0,1.13,0h2.31l1.12,0,.54,0,1-.06,1-.08c8.62-.83,12.12-4.34,13-13l.08-1,.06-1v-.54l0-1.11V16.84ZM27.6,18.86l-15,9A1,1,0,0,1,11.09,27V9a1,1,0,0,1,1.51-.86l15,9a1,1,0,0,1,0,1.72Z' />
            </svg>
          </button>
          <button className='group w-3 opacity-60 rounded cursor-pointer' onClick={(e) => handleSkip(e, 'NEXT')}>
            <svg
              width={14}
              height={14}
              className='group-hover:fill-accent fill-white '
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 36 36'
            >
              <path d='M36,14.2l-.08-1C35,4.55,31.45,1,22.83.21l-2-.16h-4L15.74.1H15.2l-1.06,0-1,.08C4.55,1,1,4.55.21,13.17l-.16,2v4l.05,1.1v.54l.16,2c.82,8.62,4.34,12.14,13,13l1,.08.94.15h5.6l1-.08,1-.08c8.62-.82,12.14-4.34,13-13l.08-1,0-1v-4l.07-1.1V15.2ZM11.32,25.9A2,2,0,0,1,8.46,23l5-5-5-5a2,2,0,0,1,0-2.86,2,2,0,0,1,2.86,0l6.46,6.47a2,2,0,0,1,.6,1.43,2,2,0,0,1-.6,1.43Zm16.22-6.47L21.07,25.9A2,2,0,0,1,18.21,23l5-5-5-5a2,2,0,0,1,0-2.86,2.12,2.12,0,0,1,1.43-.59,2,2,0,0,1,1.43.59l6.47,6.47a2.06,2.06,0,0,1,.6,1.43A2,2,0,0,1,27.54,19.43Z' />
            </svg>
          </button>
        </div>

        <div className='flex gap-1.5 justify-end items-center'>
          <button className='group w-3 opacity-60 rounded cursor-pointer' onClick={(e) => handleShowEditor(e)}>
            {showEditor ? (
              <svg
                width={14}
                height={14}
                className='group-hover:fill-accent fill-white'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 36 36'
              >
                <path d='m35.99,16.84l-.03-1.1c-.01-.19-.02-.37-.03-.54l-.06-1.04-.08-1C34.96,4.55,31.45,1.04,22.84.21l-1-.09-1.04-.06-.54-.02-1.11-.03h-.57s-.58-.01-.58-.01c-.39,0-.78,0-1.16.01l-1.11.03c-.18.01-.36.01-.53.02l-1.05.06-.99.09C4.54,1.04,1.04,4.55.2,13.16l-.08,1-.06,1.04-.02.54-.03,1.1v.58s0,.58,0,.58C0,18.39,0,18.78.01,19.16l.03,1.1c0,.18.01.36.02.54l.06,1.04.08,1c.84,8.61,4.34,12.12,12.96,12.95l.99.09,1.05.06.53.02,1.11.03h1.16s1.15,0,1.15,0l1.11-.03c.18-.01.36-.01.54-.02l1.04-.06,1-.09c8.61-.83,12.12-4.34,12.95-12.95l.08-1,.06-1.04.03-.54.03-1.1v-1.16s0-1.16,0-1.16Zm-12.65,3.01h-10.69c-1.02,0-1.85-.83-1.85-1.85s.83-1.85,1.85-1.85h10.69c1.02,0,1.85.83,1.85,1.85s-.83,1.85-1.85,1.85Z' />
              </svg>
            ) : (
              <svg
                width={14}
                height={14}
                className='group-hover:fill-accent fill-white'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 36 36'
              >
                <path d='m18,0h.58s.57,0,.57,0l1.11.03.54.02,1.04.06,1,.08c8.61.84,12.12,4.34,12.95,12.95l.08,1,.06,1.04c0,.18.02.36.02.54l.03,1.11v1.16s0,1.16,0,1.16l-.03,1.11-.02.54-.06,1.04-.08,1c-.84,8.61-4.34,12.12-12.95,12.95l-1,.08-1.04.06c-.18,0-.36.02-.54.02l-1.11.03h-1.16s-1.16,0-1.16,0l-1.11-.03-.54-.02-1.04-.06-1-.08C4.55,34.96,1.04,31.45.21,22.84l-.08-1-.06-1.04c0-.18-.02-.36-.02-.54l-.03-1.11C0,18.78,0,18.39,0,18v-.58s0-.57,0-.57l.03-1.11.02-.54.06-1.04.08-1C1.04,4.55,4.55,1.04,13.16.21l1-.08,1.04-.06c.18,0,.36-.02.54-.02l1.11-.03c.38,0,.76,0,1.16,0Zm0,10.8c-.48,0-.94.19-1.27.53s-.53.8-.53,1.27v3.6h-3.81c-.46.07-.87.29-1.17.64-.29.35-.44.8-.42,1.26.03.46.23.89.56,1.2.33.31.77.49,1.23.49h3.6v3.81c.07.46.29.87.64,1.17.35.29.8.44,1.26.42.46-.03.89-.23,1.2-.56.31-.33.49-.77.49-1.23v-3.6h3.81c.46-.07.87-.29,1.17-.64.29-.35.44-.8.42-1.26-.03-.46-.23-.89-.56-1.2-.33-.31-.77-.49-1.23-.49h-3.6v-3.81c-.06-.44-.27-.84-.6-1.13-.33-.29-.76-.45-1.2-.45Z' />
              </svg>
            )}
          </button>
          <button className='group w-3 opacity-60 rounded cursor-pointer' onClick={(e) => handleRemoveTimeStamp(e)}>
            <svg
              width={14}
              height={14}
              className='group-hover:fill-accent fill-white '
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 36 36'
            >
              <path d='M36,15.74l0-.54-.05-1-.08-1C35,4.55,31.45,1,22.83.21l-1-.08-1-.08h-.54l-1.1,0H16.84l-1.1.05H15.2L14.14.13l-1,.08C4.55,1,1,4.55.21,13.17l-.08,1-.08,1v.54l0,1.1v2.32l.05,1.1v.54l.08,1,.08,1c.82,8.62,4.34,12.14,13,13l1,.08L15.2,36h.54l1.1,0h2.32l1.1,0h.54l1-.08,1-.08c8.62-.82,12.14-4.34,13-13l.08-1,.05-1,0-.54,0-1.1V16.84Zm-8.57,8.49a2.24,2.24,0,0,1,0,3.16,2.18,2.18,0,0,1-3.16,0L18,21.18l-6.28,6.21a2.12,2.12,0,0,1-1.58.68,2.07,2.07,0,0,1-1.58-.68,2.24,2.24,0,0,1,0-3.16L14.83,18,8.57,11.74a2.23,2.23,0,0,1,3.16-3.16L18,14.84l6.26-6.26a2.23,2.23,0,1,1,3.16,3.16L21.17,18Z' />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
