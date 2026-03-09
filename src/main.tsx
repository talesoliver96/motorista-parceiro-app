import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import App from "./App";
import { AppThemeProvider } from "./app/providers/AppThemeProvider";
import { AuthProvider } from "./app/providers/AuthProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppThemeProvider>
        <SnackbarProvider maxSnack={3} autoHideDuration={2500}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </SnackbarProvider>
      </AppThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);