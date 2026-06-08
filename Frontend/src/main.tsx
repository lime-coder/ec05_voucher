
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  // Global fetch interceptor to automatically attach Authorization header for raw fetch calls
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    
    if (typeof resource === 'string' && resource.startsWith('/api')) {
      const token = localStorage.getItem('token');
      if (token) {
        config = config || {};
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`
        };
      }
      args = [resource, config];
    }
    
    return originalFetch(...args);
  };

  createRoot(document.getElementById("root")!).render(<App />);
  
