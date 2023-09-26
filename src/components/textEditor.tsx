/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import ReactQuill from 'react-quill'
import { CustomToolbar } from './customToolBar'
import useThrottle from './useThrottle'
import 'react-quill/dist/quill.snow.css'
import { fetchBookmarks } from '../../utils'
interface TextProp {
  index: number
  vid: string
  content: string
}

export const TextEditor: React.FC<TextProp> = ({ index, vid, content }) => {
  const [texts, setTexts] = useState(content)
  const throttledValue = useThrottle(texts)
  const [showToolbar, setShowToolbar] = useState(false)

  useEffect(() => {
    const onSave = async () => {
      const bookmarks = await fetchBookmarks()
      bookmarks[vid].notes[index].desc = throttledValue
      chrome.storage.local.set({ data: JSON.stringify(bookmarks) })
    }
    onSave()
  }, [throttledValue])

  const formats = ['header', 'bold', 'italic', 'underline', 'list', 'indent']
  const modules = {
    toolbar: {
      container: `#toolbar-${vid}-${index}`
    }
  }
  const handleOnFocus = () => {
    setShowToolbar(true)
  }
  const handleOnChange = (content: string, _delta, _source, editor) => {
    const html = editor.getHTML()
    if (html.replace(/<(.|\n)*?>/g, '').trim().length === 0) setTexts('')
    else setTexts(html)
  }
  return (
    <div className='text-background'>
      <div> {`show content: ${content} text: ${texts}`}</div>
      <div className={showToolbar ? 'block' : 'hidden'}>
        <CustomToolbar id={`toolbar-${vid}-${index}`} />
      </div>

      <ReactQuill
        formats={formats}
        modules={modules}
        theme='snow'
        value={texts}
        onBlur={() => setShowToolbar(false)}
        onFocus={handleOnFocus}
        onChange={handleOnChange}
      ></ReactQuill>
    </div>
  )
}
