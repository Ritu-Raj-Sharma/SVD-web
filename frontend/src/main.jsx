// src/main.jsx
// -----------------------------------------------------------------------------
// Entry point of the React application.
// This file does exactly one job: find the <div id="root"> in index.html and
// render our <App /> component tree into it.
// -----------------------------------------------------------------------------
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter enables client-side routing, so we can have different
        "pages" (URLs like / and /view) without full page reloads. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
