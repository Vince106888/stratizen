import React, { Suspense, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './main.css';
import { ThemeProvider } from './context/ThemeContext'; // ✅ Import ThemeProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider> {/* ✅ Wrap App with ThemeProvider */}
        <Suspense fallback={<div className="loading-screen">Loading Stratizen...</div>}>
          <App />
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
