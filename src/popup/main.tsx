import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// UI STRIPPED (full rebuild, step 1). Theme provider deleted with the UI;
// reintroduce a theme mechanism in the rebuild if needed.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
