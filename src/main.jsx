// import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
    // quite el modo estricto, porque me daba un error en en lo de confirmar password por el doble render
)
