chrome.runtime.onInstalled.addListener(() => {
  console.log('onInstall')
  chrome.action.setBadgeText({
    text: 'OFF'
  })
})

// when update youtube watch tab
const youtubeUrl = 'youtube.com/watch'

chrome.tabs.onUpdated.addListener(async (tabId, tab) => {
  if (tab.url && tab.url.includes(youtubeUrl)) {
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id })
    // Next state will always be the opposite
    const nextState = prevState === 'ON' ? 'OFF' : 'ON'

    // Set the action badge to the next state
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState
    })
    const queryParameters = tab.url.split('?')[1]
    const urlParameters = new URLSearchParams(queryParameters)

    chrome.tabs.sendMessage(tabId, {
      type: 'NEW',
      videoId: urlParameters.get('v')
    })
  }
})
