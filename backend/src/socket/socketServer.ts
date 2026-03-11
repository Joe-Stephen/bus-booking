import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { handleConnection } from "./socketHandlers";

export const initializeSocket = (httpServer: HttpServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Or appropriately restrict to frontend origin
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    handleConnection(socket, io);
  });

  return io;
};
