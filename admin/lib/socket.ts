import { io } from "socket.io-client";

// The backend is running on port 4000
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});
