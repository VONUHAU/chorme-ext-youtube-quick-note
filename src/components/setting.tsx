import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { ColorPicker } from './colorPicker'
import { getCurrentTab } from '../../utils'
type ModalProp = {
  setModalOpen: Dispatch<SetStateAction<boolean>>
}

export const SettingModal: React.FC<ModalProp> = ({ setModalOpen }) => {
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

  const handleOnChange = async() => {
    setIsChecked(!isChecked)
    const tab = await getCurrentTab()
    chrome.storage.local.set({ hiddenBookmarks: !isChecked })
    chrome.tabs.sendMessage(tab.id!, { type: 'UPDATE_CONTENT_UI_SETTING' })
  }
  return (
    <div className='modal'>
      <div className='fixed z-[99] top-1/2 rounded-lg py-2 px-4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-52 bg-[#2a243b]'>
        <div className=''>
          <div className=''>
            <h3 className='text-center text-base font-bold mb-2'>Setting</h3>
          </div>
          <label className='relative inline-flex items-center cursor-pointer mb-1'>
            <input type='checkbox' checked={isChecked} onChange={handleOnChange} className='sr-only peer' />
            <div className="w-10 h-5 peer-checked:bg-accent bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-[110%] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:accent"></div>
            <span className='ml-3 text-sm text-background'>Hide bookmarks</span>
          </label>
          <div className='flex justify-start gap-4 items-center'>
            <ColorPicker />
            <div className='ml-3 text-sm text-background'>Bookmark color</div>
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
    </div>
  )
}
