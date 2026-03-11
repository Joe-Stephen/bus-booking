import { Server, Socket } from "socket.io";
import prisma from "../config/prisma";

export const handleConnection = (socket: Socket, io: Server) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("bus:location:update", async (data) => {
    try {
      if (!data || !data.busId || data.latitude === undefined || data.longitude === undefined) {
          return;
      }
      
      const { busId, latitude, longitude, speed, heading } = data;

      // Upsert latest location into the database
      const upsertedLocation = await prisma.busLocation.upsert({
        where: { busId: String(busId) },
        update: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          speed: speed ? Number(speed) : null,
          heading: heading ? Number(heading) : null,
        },
        create: {
          busId: String(busId),
          latitude: Number(latitude),
          longitude: Number(longitude),
          speed: speed ? Number(speed) : null,
          heading: heading ? Number(heading) : null,
        },
      });

      // Broadcast location to clients subscribed to this bus
      io.to(`bus-${upsertedLocation.busId}`).emit("bus:location:broadcast", {
        busId: upsertedLocation.busId,
        latitude: upsertedLocation.latitude,
        longitude: upsertedLocation.longitude,
        speed: upsertedLocation.speed,
        updatedAt: upsertedLocation.updatedAt,
      });

    } catch (error) {
      console.error("Error updating bus location via socket:", error);
    }
  });

  socket.on("bus:subscribe", (data) => {
    if (data && data.busId) {
      const roomName = `bus-${data.busId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} subscribed to ${roomName}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};
