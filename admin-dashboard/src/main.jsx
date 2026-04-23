import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Error Handler for Debugging the White Screen
window.onerror = function (message, source, lineno, colno, error) {
  const isDev = import.meta.env.DEV;
  document.body.innerHTML = `
    <div style="padding: 20px; background: #0f172a; color: #f8fafc; font-family: Inter, sans-serif; min-height: 100vh;">
      <h3 style="margin-bottom: 12px; color: #f87171;">Application Error</h3>
      <p style="margin: 0 0 8px;">The dashboard encountered an unexpected error.</p>
      <p style="margin: 0 0 16px; color: #94a3b8;">Please refresh the page or sign in again. If the issue continues, contact the administrator.</p>
      ${
        isDev
          ? `<details>
              <summary style="cursor:pointer;">Developer details</summary>
              <pre style="white-space: pre-wrap; margin-top: 12px;"><strong>Message:</strong> ${message}
<strong>Source:</strong> ${source}:${lineno}:${colno}

${error?.stack || 'No stack trace'}</pre>
            </details>`
          : ''
      }
    </div>
  `;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
