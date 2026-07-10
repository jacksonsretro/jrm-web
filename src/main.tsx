import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'

const rootElement = document.getElementById('root')

function showBootError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  if (rootElement) {
    rootElement.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#f3f6fa;font-family:Segoe UI,Arial,sans-serif">
        <section style="max-width:720px;background:white;border:1px solid #dfe6ee;border-radius:16px;padding:28px;box-shadow:0 15px 45px #1522361a">
          <h1 style="margin-top:0;color:#152132">JRM could not start</h1>
          <p style="color:#5f6f82;line-height:1.6">The page files loaded, but the application encountered an error.</p>
          <pre style="white-space:pre-wrap;background:#f5f7fa;padding:14px;border-radius:10px;color:#8c1d2c">${message.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c] ?? c))}</pre>
          <p style="color:#5f6f82">Refresh the page. If this remains visible, send a screenshot of this message.</p>
        </section>
      </main>`
  }
}

window.addEventListener('error', event => showBootError(event.error ?? event.message))
window.addEventListener('unhandledrejection', event => showBootError(event.reason))

try {
  if (!rootElement) throw new Error('The page is missing the #root application element.')
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode><App /></React.StrictMode>,
  )
} catch (error) {
  showBootError(error)
}
