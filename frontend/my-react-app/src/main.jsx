import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ApiProvider } from "./context/ApiContext.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/theme.css";
import "./styles/modern.css";

import { BrowserRouter } from "react-router-dom"; 
import { CompanyProvider } from "./context/CompanyContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApiProvider>
    <BrowserRouter>
      <AuthProvider>
        <CompanyProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
    </ApiProvider>
  </StrictMode>,
)
