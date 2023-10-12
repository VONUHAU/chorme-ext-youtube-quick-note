import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Turnstone from 'turnstone'
import { Item } from '../Interface'
import useThrottle from '../hooks/useThrottle'
type Props = {
  data: Item[]
  mapData: Item[]
  setData: Dispatch<SetStateAction<Item[]>>
}

const styles = {
  input: 'w-full border bg-background_rgba text-accent py-1 px-2 outline-none rounded',
  listbox: 'bg-accent w-full text-background rounded-md shadow-lg',
  highlightedItem: 'bg-[#7564c7]',
  query: 'text-accent placeholder:text-slate-400',
  typeahead: 'text-slate-500',
  noItems: 'cursor-default text-center my-2',
  match: 'font-semibold',
  groupHeading: 'px-5 py-3 text-pink-500'
}

export default function SearchBar({ data, setData }: Props) {
  const [search, setSearch] = useState<string>('')
  const throttledValue = useThrottle(search)

  const listbox = {
    id: 'search',
    displayField: 'title',
    data: data,
    searchType: 'contains'
  }
  useEffect(() => {
    if (!search) {
      setData(data)
    }
    try {
      const filter = data.filter((val) => {
        if (val.search) {
          return val.search.toLowerCase().includes(search.toLowerCase())
        }
        return false
      })
      setData(filter)
    } catch (err) {
      console.log(err)
    }
  }, [throttledValue])

  const handleOnChange = (value: string) => {
    setSearch(value)
  }

  return (
    <Turnstone
      id='search'
      name='search'
      debounceWait={250}
      listboxIsImmutable={true}
      maxItems={6}
      listbox={listbox}
      styles={styles}
      onChange={handleOnChange}
      noItemsMessage='No item'
      placeholder='Select your youtube card'
    />
  )
}
