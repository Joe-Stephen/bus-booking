import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { handleConnection } from "./socketHandlers";
import { verifyToken } from "../utils/jwt";

export const initializeSocket = (httpServer: HttpServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Or appropriately restrict to frontend origin
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    try {
      // The token can be passed in auth payload: socket.io(url, { auth: { token: "..." } })
      const token = socket.handshake.auth?.token;
      if (token) {
        const decoded = verifyToken(token);
        socket.data.user = decoded; // Attach user payload so handlers can check roles
      }
    } catch (error) {
      console.log(`Socket auth failed for ${socket.id}, proceeding as anonymous listener.`);
      // We don't return next(new Error(...)) because passengers might connect unauthenticated just to listen
    }
    next();
  });

  io.on("connection", (socket) => {
    handleConnection(socket, io);
  });

  return io;
};
