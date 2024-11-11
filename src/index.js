// Import dependencies at the top
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// Any other code, such as setup functions or initializations, should follow imports
const resizeObserverError = (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopImmediatePropagation();
  }
};
window.addEventListener('error', resizeObserverError);

// Render the application
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);