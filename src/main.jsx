// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#252525",
            color: "#f1f5f9",
            border: "1px solid rgba(249,115,22,0.3)",
            fontFamily: "DM Sans, sans-serif",
          },
          success: { iconTheme: { primary: "#ff9a3d", secondary: "#252525" } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>,
);
