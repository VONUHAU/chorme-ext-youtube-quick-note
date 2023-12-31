/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react'

type Props = {
  message: string
  setMessage: any
}

export default function Toast({ message, setMessage }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<any>()
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setMessage('')
    }, 2900)
    return () => clearTimeout(timeoutRef.current)
  }, [message, setMessage])

  const handleClick = () => {
    setMessage('')
    clearTimeout(timeoutRef.current)
  }
  return (
    <div ref={ref} className={`toast-wrapper hidden ${message ? 'show' : ''}`} onClick={handleClick}>
      <div className='toast text-center fixed left-1/2 -translate-x-1/2 z-50 top-[10px] bg-error rounded text-background w-10/12 p-1.5 font-sans text-sm'>
        {message}
      </div>
      {/* <div className='toast-overlay fixed top-0 left-0 w-full h-full bg-background opacity-70'></div> */}
    </div>
  )
}
