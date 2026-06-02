import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Filter out safe MediaPipe/TensorFlow info logs that mistakenly output to error/warn channels
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('TensorFlow Lite XNNPACK delegate')) return;
  originalConsoleError(...args);
};
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('TensorFlow Lite XNNPACK delegate')) return;
  originalConsoleWarn(...args);
};
console.info = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('TensorFlow Lite XNNPACK delegate')) return;
  originalConsoleInfo(...args);
};
// Also patch log just in case
const originalConsoleLog = console.log;
console.log = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('TensorFlow Lite XNNPACK delegate')) return;
  originalConsoleLog(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

