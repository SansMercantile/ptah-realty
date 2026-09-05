import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
// Unused inside the main Ptah app (CRMApp is imported directly by the
// outer src/App.tsx) -- this file only exists so `npm run dev` still
// works if someone opens src/crm/ as a standalone Vite project again,
// same as it did in the original AI Studio export.
import App from './CRMApp.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
