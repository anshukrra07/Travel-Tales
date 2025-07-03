const isNativeApp = !!(window.Capacitor?.isNativePlatform?.());

const isLocalhost =
  location.hostname === "localhost" ||
  location.hostname.startsWith("127.") ||
  location.hostname.startsWith("192.168.") ||
  location.hostname === "::1";

// ✅ Always use remote backend in app, local only for web dev
const BACKEND_URL = (isNativeApp || !isLocalhost)
  ? "https://travel-tales-f0hb.onrender.com"
  : "http://localhost:5001";

console.log("✅ Using BACKEND_URL:", BACKEND_URL);