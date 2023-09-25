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
