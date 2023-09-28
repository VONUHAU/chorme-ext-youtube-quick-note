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
    }, 2500)
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const handleClick = () => {
    setMessage('')
    clearTimeout(timeoutRef.current)
  }
  return (
    <div ref={ref} className='toast-wrapper' onClick={handleClick}>
      <div className='toast fixed left-1/2 -translate-x-1/2 z-50 top-[10px] bg-error rounded text-background w-10/12 p-1.5 font-sans text-sm'>
        {message}
      </div>
      {/* <div className='toast-overlay fixed top-0 left-0 w-full h-full bg-background opacity-70'></div> */}
    </div>
  )
}
