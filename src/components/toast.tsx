import { useEffect, useRef } from 'react'

type Props = {
  message: string
  setMessage: any
}

export default function Toast({ message, setMessage }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setTimeout(() => {
      ref.current.style.opacity = '0'
      setMessage('')
    }, 4500)
  }, [])
  return (
    <div
      ref={ref}
      className='toast absolute transition-all left-0 top-0 bg-accent rounded-br-[2px] rounded-tr-[2px] text-background w-10/12 p-1.5 font-sans text-sm'
    >
      {message}
    </div>
  )
}
