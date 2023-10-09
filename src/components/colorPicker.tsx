import React, { useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'
import { getCurrentTab } from '../../utils'

export const ColorPicker = () => {
  const [displayColor, setDisplayColor] = useState(false)
  const [color, setColor] = useState({
    r: '89',
    g: '235',
    b: '44',
    a: '1'
  })

  // fetch color form google storage
  useEffect(() => {
    const getSettingColor = async () => {
      const getStorage = await chrome.storage.local.get(['bookmarkColor'])
      if (getStorage && getStorage.bookmarkColor) {
        setColor(JSON.parse(getStorage.bookmarkColor))
      }
    }
    getSettingColor()
  }, [])

  const handleClick = () => {
    setDisplayColor(!displayColor)
  }

  const handleClose = async () => {
    setDisplayColor(false)
    const tab = await getCurrentTab()
    chrome.storage.local.set({ bookmarkColor: JSON.stringify(color) })
    chrome.tabs.sendMessage(tab.id!, { type: 'UPDATE_CONTENT_UI_SETTING' })
  }

  const handleChange = (color) => {
    setColor(color.rgb)
  }

  return (
    <>
      <div className='rounded-full bg-secondary p-[3px] inline-block cursor-pointer' onClick={handleClick}>
        <div
          className='w-5 h-5 rounded-full'
          style={{
            background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
          }}
        />
      </div>
      {displayColor ? (
        <div className='absolute top-[-80px]'>
          <div className='fixed inset-0 text-text' onClick={handleClose} />
          <SketchPicker width={180} color={color} onChange={handleChange} presetColors={[]} />
        </div>
      ) : null}
    </>
  )
}
