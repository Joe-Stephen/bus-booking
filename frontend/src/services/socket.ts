import { io, Socket } from "socket.io-client";

// Get socket URL from environment or default to localhost
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Export a singleton instance of the socket connection
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});
