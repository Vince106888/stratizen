import React, { Suspense, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './main.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div className="loading-screen">Loading Stratizen...</div>}>
        <App />
      </Suspense>
    </BrowserRouter>
  </StrictMode>
);
