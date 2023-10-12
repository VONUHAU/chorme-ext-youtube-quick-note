import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { SketchPicker } from 'react-color'
import { getCurrentTab } from '../../utils'

type ColorProp = {
  color: {
    r: string
    g: string
    b: string
    a: string
  }
  setColor: Dispatch<SetStateAction<ColorProp['color']>>
}
export const ColorPicker: React.FC<ColorProp> = ({ color, setColor }) => {
  const [displayColor, setDisplayColor] = useState(false)

  // fetch color form google storage
  useEffect(() => {
    const getSettingColor = async () => {
      const getStorage = await chrome.storage.local.get(['bookmarkColor'])
      console.log(getStorage.bookmarkColor)
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
  }

  const handleChangeComplete = async (value) => {
    const tab = await getCurrentTab()
    chrome.tabs.sendMessage(tab.id!, { type: 'UPDATE_COLOR_SETTING', value: value.rgb })
  }

  const handleChange = (value) => {
    setColor(value.rgb)
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
        <div className='absolute top-[-90px]'>
          <div className='fixed inset-0 text-text' onClick={handleClose} />
          <SketchPicker
            width={200}
            color={color}
            onChangeComplete={handleChangeComplete}
            onChange={handleChange}
            presetColors={[]}
          />
        </div>
      ) : null}
    </>
  )
}
