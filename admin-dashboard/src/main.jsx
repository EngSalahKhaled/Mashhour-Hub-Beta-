import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Error Handler for Debugging the White Screen
window.onerror = function (message, source, lineno, colno, error) {
  document.body.innerHTML = `
    <div style="padding: 20px; background: #222; color: #ff5555; font-family: monospace;">
      <h3>Fatal Application Error</h3>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Source:</strong> ${source}:${lineno}:${colno}</p>
      <details>
        <summary>Stack Trace</summary>
        <pre>${error?.stack || 'No stack trace'}</pre>
      </details>
    </div>
  `;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
