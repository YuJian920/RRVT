import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'prismjs/themes/prism-okaidia.css'; // Import PrismJS theme
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
