import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  // noticed the api call being made twice on mount and realized it was because of React StrictMode in development causing components to mount, unmount, and remount to help identify side effects
  // tested without and api calls were made once and only when expected, keeping just for the sake of this project
  <StrictMode>
    <App />
  </StrictMode>,
);
