import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async"; // Import the provider
import { CartProvider } from "./Context/CartContext.jsx"; // 1. Added our brand new Cart Context
import App from "./App.jsx";
import "./Styles/Index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider> {/* Wrap the app to enable dynamic meta tags */}
      <BrowserRouter>
        <CartProvider> {/* 2. Wrapped App so every page can see the bundle cart */}
          <App />
        </CartProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);