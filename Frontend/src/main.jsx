import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./index.css";
import App from "./App.jsx";
import 'bootstrap-icons/font/bootstrap-icons.css';
import axiosClient from "./api/axiosClient";

const AUTO_CHECKOUT_URL = `${axiosClient.defaults.baseURL}/attendance/auto-checkout`;

// Auto-checkout only when the page is actually being closed/unloaded.
const sendAutoCheckout = () => {
  const empId = localStorage.getItem("employee_id");
  if (!empId || empId === "undefined") return;
  const payload = JSON.stringify({ employee_id: Number(empId) });
  navigator.sendBeacon(
    AUTO_CHECKOUT_URL,
    new Blob([payload], { type: "application/json" })
  );
};

window.addEventListener("pagehide", sendAutoCheckout);
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
