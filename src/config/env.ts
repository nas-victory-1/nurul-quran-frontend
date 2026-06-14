// Centralised environment access. Both values come from .env.local and are
// exposed to the browser via the NEXT_PUBLIC_ prefix.
export const ENV = {
  // REST API base (e.g. http://localhost:8000)
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  // Socket.IO endpoint (e.g. http://localhost:8000)
  WS_URL: process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8000",
};
