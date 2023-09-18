type Props = {
  title: string
  content: {
    index: string
    timeStamp: string
    description: string
    attachments?: unknown
  }[]
  url: string
}

export default function Card({ title, content, url }: Props) {
  return (
    <div className='card rounded-md dark:bg-secondary p-2'>
      <a href={url} className='no-underline text-slate-900 dark:text-primary'>
        {' '}
        <h4 className='mb-2.5'> {title} </h4>
      </a>
      <div className='contents space-y-4'>
        {content.map((value, key) => (
          <div className='bookmark' key={key}>
            <textarea className='text-slate-500 dark:text' name='description' cols={50} rows={4}>
              {value.description}
            </textarea>
          </div>
        ))}
      </div>
    </div>
  )
}
