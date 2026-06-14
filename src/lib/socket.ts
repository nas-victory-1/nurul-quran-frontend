import { io, Socket } from "socket.io-client";

import { ENV } from "@/config/env";
import { SOCKET_EVENTS } from "@/consts";

// Single shared Socket.IO connection for the whole app.
// autoConnect is false so pages decide when to open the connection.
const socket: Socket = io(ENV.WS_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

// ---------------------------------------------------------------------------
// Incoming event payloads (server -> client). The backend broadcasts these in
// response to the judge's REST calls; the projector view only listens.
// ---------------------------------------------------------------------------

// `page_update` on the `contest_pages` room.
export type PageUpdateEvent =
  | {
      action: "show";
      page_data: {
        page_number: number;
        page_url: string;
        first_verse_on_page_chapter_name: string;
        first_verse_on_page_chapter_number: string;
        first_verse_on_page_verse_number: string;
      };
    }
  | { action: "remove" };

// `broadcast_selected_question_number` on the `contestants` room. This is the
// raw body the judge POSTs to /contestants/broadcast, so the shape is ours.
export interface SelectedQuestionEvent {
  contestantName: string;
  questionString: string;
}

// ---------------------------------------------------------------------------
// Connection management
// ---------------------------------------------------------------------------

export const connectSocket = (): Socket => {
  if (!socket.connected) socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

// Subscribe to a room. The backend `join` handler adds the socket to the room.
export const joinRoom = (room: string) => {
  connectSocket();
  socket.emit(SOCKET_EVENTS.JOIN, { room });
};

export const leaveRoom = (room: string) => {
  socket.emit("leave", { room });
};

export default socket;
