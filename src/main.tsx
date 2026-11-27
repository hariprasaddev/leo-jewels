import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { StoreProvider } from "@/context/StoreContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { CatalogueProvider } from "@/context/CatalogueContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CatalogueProvider>
      <StoreProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </StoreProvider>
    </CatalogueProvider>
  </React.StrictMode>
);
