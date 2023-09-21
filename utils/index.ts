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
