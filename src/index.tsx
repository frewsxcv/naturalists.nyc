import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const elem = document.getElementById('root');

if (!elem) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(elem);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
