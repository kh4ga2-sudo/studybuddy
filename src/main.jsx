import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext.jsx';
import App from './App.jsx';
import './styles.css';
import './styles-pages.css';
import './styles-major.css';
import './styles-materials.css';
import './styles-notifications.css';
import './styles-signup.css';
import './styles-responsive.css';
import './missing-classes.css';
import './styles-premium-polish.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);
