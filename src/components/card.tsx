import { getCurrentTab } from '../../utils'
import { Item } from '../Interface'
import { TextEditor } from './textEditor'
export default function Card({ title, notes, url, vid }: Item) {
  const handlePlayAtTime = async (time: string) => {
    const tab = await getCurrentTab()
    console.log(vid)
    const response = await chrome.tabs.sendMessage(tab.id!, {
      type: 'PLAY',
      time,
      url,
      vid
    })
  }
  return (
    <div className='card rounded-md dark:bg-secondary p-2'>
      <a href={url} className='no-underline text-slate-900 dark:text-primary'>
        {' '}
        <h4 className='mb-2.5'> {title} </h4>
      </a>
      <div className='contents space-y-4'>
        {notes.map((value, key) => (
          <div className='bookmark' key={key}>
            <div
              className='timestamp text-accent italic cursor-pointer'
              onClick={() => handlePlayAtTime(value.timeStamp)}
            >
              {value.timeStamp}
            </div>
            <TextEditor content={'hello world'} />
          </div>
        ))}
      </div>
    </div>
  )
}
