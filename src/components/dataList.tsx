import { Dispatch, SetStateAction, useState } from 'react'
import Turnstone from 'turnstone'
import { Item } from '../Interface'
type Props = {
  data: Item[]
  mapData: Item[]
  setData: Dispatch<SetStateAction<Item[]>>
}

export default function Datalist({ data, setData }: Props) {
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

  const listbox = {
    id: 'title',
    displayField: 'title',
    data: data,
    searchType: 'contains'
  }
  const handleOnEnter = (value: string, selectedItem: any) => {
    console.log(selectedItem)
    if(!value){
      setData(data)
    }
    setData([selectedItem.value])
  }
  const handleOnChange = (value) => {
    console.log(value)
  }
  // const handleOnSelect = (value: Item) => {
  //   if (value) {
  //     setData([value])
  //     return
  //   }
  //   console.log("select")
  // }
  return (
    <Turnstone
      id='search'
      name='search'
      debounceWait={250}
      listboxIsImmutable={true}
      maxItems={6}
      listbox={listbox}
      styles={styles}
      onEnter={handleOnEnter}
      onChange={handleOnChange}
      noItemsMessage='No item'
      placeholder='Select your youtube card'
    />
  )
}
