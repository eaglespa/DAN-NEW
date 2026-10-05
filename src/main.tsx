import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and gracefully suppress harmless PayPal SDK internal DOM detachment warnings
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const msg = reason?.message || String(reason || '');
  if (
    msg.includes('Detected container element removed from DOM') ||
    msg.includes('container element removed') ||
    msg.includes('paypal_js_sdk') ||
    (reason?.stack && reason.stack.includes('paypal.com/sdk/js'))
  ) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (
    msg.includes('Detected container element removed from DOM') ||
    msg.includes('container element removed') ||
    (event.filename && event.filename.includes('paypal.com/sdk/js'))
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
