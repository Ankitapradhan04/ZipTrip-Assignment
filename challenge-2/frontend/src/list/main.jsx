import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import '../shared/theme.css';
import './list.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
