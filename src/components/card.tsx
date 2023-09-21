import { Item } from "../Interface"

export default function Card({ title, notes, url }: Item) {
  return (
    <div className='card rounded-md dark:bg-secondary p-2'>
      <a href={url} className='no-underline text-slate-900 dark:text-primary'>
        {' '}
        <h4 className='mb-2.5'> {title} </h4>
      </a>
      <div className='contents space-y-4'>
        {notes.map((value, key) => (
          <div className='bookmark' key={key}>
            <textarea className='text-slate-500 dark:text' name='description' cols={50} rows={4}>
              {value.desc}
            </textarea>
          </div>
        ))}
      </div>
    </div>
  )
}
