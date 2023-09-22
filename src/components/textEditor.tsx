/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
interface TextProp {
  content: string
}

export const TextEditor: React.FC<TextProp> = ({ content }) => {
  const [texts, setTexts] = useState(content)
  const modules = {
    toolbar: [[{ header: [1, 2, false] }], ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block']]
  }

  const handleOnChange = (value: string, editor: any) => {
    console.log(editor)
    setTexts(value)
  }
  return (
    <div className='text-text'>
      <ReactQuill theme='snow' value={texts} modules={modules} onChange={handleOnChange}></ReactQuill>
    </div>
  )
}
