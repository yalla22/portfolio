import React from "react";
import ReactDOM from "react-dom/client";

// Self-hosted fonts — woff2-only, latin subset (see styles/fonts.css)
import "./styles/fonts.css";

import "./styles/tokens.css";
import "./styles/global.css";

import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
