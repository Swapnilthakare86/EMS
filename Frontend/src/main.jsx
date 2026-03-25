import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";

// Attach JWT to every axios request globally
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import App from "./App.jsx";
import 'bootstrap-icons/font/bootstrap-icons.css';

// Auto-checkout on tab close / hide
const sendAutoCheckout = () => {
  const empId = localStorage.getItem("employee_id");
  if (!empId || empId === "undefined") return;
  const payload = JSON.stringify({ employee_id: Number(empId) });
  navigator.sendBeacon(
    "http://localhost:3000/api/attendance/auto-checkout",
    new Blob([payload], { type: "application/json" })
  );
};

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") sendAutoCheckout();
});

window.addEventListener("beforeunload", sendAutoCheckout);

console.log("main.jsx: starting render");

const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("main.jsx: #root element not found");
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log("main.jsx: render called");
}