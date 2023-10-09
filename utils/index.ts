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

export const convertVietnameseToNormal = (text: string) => {
  // Define a mapping of Vietnamese diacritical characters to their non-diacritical counterparts
  const diacriticsMap = {
    à: 'a',
    á: 'a',
    ả: 'a',
    ã: 'a',
    ạ: 'a',
    À: 'A',
    Á: 'A',
    Ả: 'A',
    Ã: 'A',
    Ạ: 'A',
    è: 'e',
    é: 'e',
    ẻ: 'e',
    ẽ: 'e',
    ẹ: 'e',
    È: 'E',
    É: 'E',
    Ẻ: 'E',
    Ẽ: 'E',
    Ẹ: 'E',
    ì: 'i',
    í: 'i',
    ỉ: 'i',
    ĩ: 'i',
    ị: 'i',
    Ì: 'I',
    Í: 'I',
    Ỉ: 'I',
    Ĩ: 'I',
    Ị: 'I',
    ò: 'o',
    ó: 'o',
    ỏ: 'o',
    õ: 'o',
    ọ: 'o',
    Ò: 'O',
    Ó: 'O',
    Ỏ: 'O',
    Õ: 'O',
    Ọ: 'O',
    ù: 'u',
    ú: 'u',
    ủ: 'u',
    ũ: 'u',
    ụ: 'u',
    Ù: 'U',
    Ú: 'U',
    Ủ: 'U',
    Ũ: 'U',
    Ụ: 'U',
    ỳ: 'y',
    ý: 'y',
    ỷ: 'y',
    ỹ: 'y',
    ỵ: 'y',
    Ỳ: 'Y',
    Ý: 'Y',
    Ỷ: 'Y',
    Ỹ: 'Y',
    Ỵ: 'Y',
    đ: 'd',
    Đ: 'D'
  }

  // Use a regular expression to match diacritics and replace them with their non-diacritical counterparts
  return text.replace(
    /[àáảãạÀÁẢÃẠèéẻẽẹÈÉẺẼẸìíỉĩịÌÍỈĨỊòóỏõọÒÓỎÕỌùúủũụÙÚỦŨỤỳýỷỹỵỲÝỶỸỴđĐ]/g,
    (match: string) => diacriticsMap[match as keyof typeof diacriticsMap] || match
  )
}
