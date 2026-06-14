export const TOTAL_MUSHAF_PAGES = 604;

// Base URL for Quran page images (matches the backend's PAGE_IMAGE_BASE).
// Used to reconstruct an image URL on the projector during state recovery.
export const QURAN_PAGE_IMAGE_BASE =
  "https://ik.imagekit.io/machelecodez/quran_images_png";

// Socket.IO rooms the projector / contestant views subscribe to. The backend
// broadcasts to these rooms; clients only join and listen.
export const SOCKET_ROOMS = {
  CONTEST_PAGES: "contest_pages",
  CONTESTANTS: "contestants",
} as const;

// Events the server emits (clients listen). `join` is the only event a client
// emits, to subscribe to a room.
export const SOCKET_EVENTS = {
  JOIN: "join",
  PAGE_UPDATE: "page_update",
  SELECTED_QUESTION_NUMBER: "broadcast_selected_question_number",
} as const;
