import { Socket } from "socket.io";

export const handleConnection = (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};
