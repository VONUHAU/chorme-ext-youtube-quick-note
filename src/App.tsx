import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  chrome.runtime.onInstalled.addListener(() => {
    console.log('onInstall')
    chrome.action.setBadgeText({
      text: 'OFF'
    })
  })
  // inital open popup
  const youtubeUrl = 'https://www.youtube.com/'
  // When the user clicks on the extension action
  chrome.action.onClicked.addListener(async (tab) => {
    console.log('onclick')
    if (tab.url!.startsWith(youtubeUrl)) {
      // We retrieve the action badge to check if the extension is 'ON' or 'OFF'
      const prevState = await chrome.action.getBadgeText({ tabId: tab.id })
      // Next state will always be the opposite
      const nextState = prevState === 'ON' ? 'OFF' : 'ON'

      // Set the action badge to the next state
      await chrome.action.setBadgeText({
        tabId: tab.id,
        text: nextState
      })
    }
  })
  return (
    <>
      <div>
        <a href='https://vitejs.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React + My Ext</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>Click on the Vite and React logos to learn more</p>
    </>
  )
}

export default App
