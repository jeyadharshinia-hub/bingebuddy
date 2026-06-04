import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { WatchlistProvider } from "./context/WatchlistProvider";
import { CommentProvider } from "./context/CommentProvider";
import { FilterProvider } from "./context/FilterProvider";
import AppLayout from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WatchlistProvider>
          <CommentProvider>
            <FilterProvider>
              <AppLayout />
            </FilterProvider>
          </CommentProvider>
        </WatchlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);