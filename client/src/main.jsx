import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { TelemetryProvider } from "./context/TelemetryContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <TelemetryProvider>
        <App />
      </TelemetryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
