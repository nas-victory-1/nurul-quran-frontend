// Centralised environment access. Both values come from .env.local and are
// exposed to the browser via the NEXT_PUBLIC_ prefix.
export const ENV = {
    // REST API base
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    // Socket.IO endpoint
    WS_URL: process.env.NEXT_PUBLIC_WS_URL,
};
