/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import ReactQuill from 'react-quill'
import { CustomToolbar } from './customToolBar'
import useThrottle from './useThrottle'
import 'react-quill/dist/quill.snow.css'
import { fetchBookmarks } from '../../utils'
import { HTMLMouseEvent } from './card'
interface TextProp {
  index: number
  vid: string
  notes: any
}

export const TextEditor: React.FC<TextProp> = ({ index, vid, notes }) => {
  const [texts, setTexts] = useState(notes[index].desc)
  const throttledValue = useThrottle(texts)
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarFocus, setToobarFocus] = useState(false)

  useEffect(() => {
    setTexts(notes[index].desc)
  }, [notes])

  useEffect(() => {
    const onSave = async () => {
      const bookmarks = await fetchBookmarks()
      bookmarks[vid].notes[index].desc = throttledValue
      console.log(throttledValue)
      chrome.storage.local.set({ data: JSON.stringify(bookmarks) })
    }
    onSave()
  }, [throttledValue])

  const formats = ['header', 'bold', 'italic', 'underline', 'list', 'indent', 'code-block']
  const modules = {
    toolbar: {
      container: `#toolbar-${vid}-${index}`
    }
  }
  const handleOnFocus = () => {
    setShowToolbar(true)
  }
  const handleOnChange = (content: string, _delta, _source, editor) =>  {
    const html = editor.getHTML()
    if (html.replace(/<(.|\n)*?>/g, '').trim().length === 0) setTexts('')
    else setTexts(html)
  }
  const handleOnBlur = () => {
    if (!toolbarFocus) {
      setShowToolbar(false)
    }
  }
  const handleOnKeyDown = (e: HTMLMouseEvent) => {
    e.stopPropagation()
  }
  return (
    <div className='text-background' onClick={(e) => handleOnKeyDown(e)}>
      <div className={showToolbar ? 'block' : 'hidden'}>
        <CustomToolbar id={`toolbar-${vid}-${index}`} />
      </div>
      <ReactQuill
        formats={formats}
        modules={modules}
        theme='snow'
        value={texts}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        onChange={handleOnChange}
      ></ReactQuill>
    </div>
  )
}
