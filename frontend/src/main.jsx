import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContainerContext";
import { BrowserRouter } from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import axios from 'axios'
import "./index.css"; // optional CSS

axios.defaults.withCredentials = true;

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById("root")).render(
  
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  
);
