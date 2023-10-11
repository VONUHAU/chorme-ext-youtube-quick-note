import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { ColorPicker } from './colorPicker'
import { getCurrentTab } from '../../utils'
import { Item } from '../Interface'
type ModalProp = {
  setModalOpen: Dispatch<SetStateAction<boolean>>
  setData: Dispatch<SetStateAction<Item[]>>
}

export const SettingModal: React.FC<ModalProp> = ({ setModalOpen, setData }) => {
  const [isChecked, setIsChecked] = useState(false)

  // get isHidden bookmarks setting
  useEffect(() => {
    const getSetting = async () => {
      const getStorage = await chrome.storage.local.get(['hiddenBookmarks'])
      console.log(getStorage.hiddenBookmarks)
      if (getStorage && getStorage.hiddenBookmarks) {
        setIsChecked(getStorage.hiddenBookmarks)
      }
    }

    getSetting()
  }, [])

  const handleOnChange = async () => {
    setIsChecked(!isChecked)
    const tab = await getCurrentTab()
    chrome.storage.local.set({ hiddenBookmarks: !isChecked })
    chrome.tabs.sendMessage(tab.id!, { type: 'UPDATE_DISPLAY_SETTING', value: !isChecked })
  }
  const handleRecover = async () => {
    const recoverData = await chrome.storage.local.get(['oldData'])
    const currentData = await chrome.storage.local.get(['data'])
    let data = null
    if (!recoverData || !recoverData.oldData) {
      return
    }
    if (currentData && currentData?.data) {
      data = currentData.data
    }
    const newData = data ? { ...JSON.parse(data), ...JSON.parse(recoverData.oldData) } : JSON.parse(recoverData.oldData)
    chrome.storage.local.set({ data: JSON.stringify(newData) })
    const bookmarks: Item[] = Object.values(newData)
    setData(bookmarks)
    setModalOpen(false)
  }
  return (
    <div className='modal'>
      <div className='fixed z-[99] top-1/2 rounded-lg py-2 px-4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-52 bg-[#2a243b]'>
        <h3 className='text-center text-base font-bold mb-2'>Setting</h3>
        <label className='relative inline-flex items-center cursor-pointer'>
          <input type='checkbox' checked={isChecked} onChange={handleOnChange} className='sr-only peer' />
          <div className="w-10 h-5 peer-checked:bg-accent bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-[110%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:accent"></div>
          <span className='ml-3 text-sm text-background'>Hide bookmarks</span>
        </label>
        <div className='flex justify-start gap-4 items-center my-1'>
          <ColorPicker />
          <div className='ml-3 text-sm text-background'>Bookmark color</div>
        </div>
        <div className='flex justify-start gap-[1.12rem] items-center'>
          <button className=' w-6 h-6 rounded group' onClick={() => handleRecover()}>
            <svg className='fill-white group-hover:fill-accent' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'>
              <path d='m19.67,1.67C10.95,1.67,3.87,8.53,3.41,17.13H1.02c-.8,0-1.29.87-.87,1.55l4.28,7.05c.38.64,1.33.64,1.74,0l4.28-7.05c.42-.68-.08-1.55-.87-1.55h-2.69c.45-6.67,5.95-11.97,12.77-11.97s12.85,5.76,12.85,12.85-5.76,12.85-12.85,12.85c-2.54,0-4.96-.72-7.05-2.12-.8-.53-1.89-.3-2.43.49-.53.8-.3,1.89.49,2.43,2.65,1.78,5.76,2.69,8.98,2.69,9.02,0,16.33-7.31,16.33-16.33S28.69,1.67,19.67,1.67Z' />
              <path d='m18.99,19.48l4.77,2.31c.27.11.49.19.76.19.64,0,1.29-.38,1.59-.99.42-.87.08-1.93-.8-2.35l-3.79-1.86-.11-6.29c0-.95-.8-1.74-1.78-1.71-.95,0-1.74.8-1.71,1.78l.11,7.39c0,.61.38,1.21.95,1.52Z' />
            </svg>
          </button>
          <div className='ml-3 text-sm text-background'>Recover Bookmarks</div>
        </div>
        <div className='absolute right-4 bottom-4'>
          <button
            className='hover:ring-2 hover:ring-purple-300 focus:ring-2 focus:ring-purple-300 text-background leading-5 bg-accent text-center outline-none px-3.5 py-1.5 rounded-full'
            onClick={() => setModalOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
