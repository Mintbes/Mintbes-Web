import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/i18n.js'
import { initGeoLanguage } from './i18n/geoDetection.js'
import App from './App.jsx'

// Automatically detect language based on user's country IP (Spanish for Latin/Spanish countries, English for rest)
initGeoLanguage();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
