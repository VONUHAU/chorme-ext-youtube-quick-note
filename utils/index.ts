/* eslint-disable @typescript-eslint/no-explicit-any */
import { Item } from '../src/Interface'
export const getCurrentTab = async () => {
  const [tab] = await chrome.tabs.query({
    currentWindow: true,
    active: true
  })

  return tab
}

export const fetchBookmarks = async () => {
  const getStorage = await chrome.storage.local.get(['data'])
  if (getStorage && getStorage.data) {
    return JSON.parse(getStorage.data)
  }
}

export const formatTimeStamp = (time: number) => {
  const date = new Date(0)
  date.setSeconds(time)
  return date.toISOString().substr(11, 8)
}

export const transformObj2Arr = (obj: any, vid: string) => {
  let currentItem = null
  if (obj[vid]) {
    currentItem = obj[vid]
    delete obj[vid]
  }
  let arr = Object.values(obj)
  arr = arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  currentItem && arr.unshift(currentItem)
  return arr
}

