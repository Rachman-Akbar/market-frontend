import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { Providers } from "@/shared/providers/Providers";
import "./styles/globals.css";

document.title = "Ziip — Marketplace Hijau dan Terpercaya";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Providers>
        <App />
      </Providers>
    </BrowserRouter>
  </StrictMode>,
);
