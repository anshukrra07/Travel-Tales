const hostname = window.location.hostname;

const isLocalhost =
  hostname === "localhost" ||
  hostname.startsWith("127.") ||
  hostname.startsWith("192.168.") ||
  hostname === "::1" ||
  window.location.protocol === "file:";

const BACKEND_URL = isLocalhost
  ? "http://localhost:5001"
  : "https://travel-tales-f0hb.onrender.com";