import { Server, Socket } from "socket.io";
import prisma from "../config/prisma";

const rateLimits = new Map<string, number>();

export const handleConnection = (socket: Socket, io: Server) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("bus:location:update", async (data) => {
    try {
      // 1. Authorization: Only authenticated DRIVER or ADMIN can emit updates
      const user = socket.data.user;
      if (!user || (user.role !== "DRIVER" && user.role !== "ADMIN")) {
        console.warn(`Unauthorized location update attempt from socket ${socket.id}`);
        return;
      }

      if (!data || !data.busId || data.latitude === undefined || data.longitude === undefined) {
          return;
      }
      
      const { busId, latitude, longitude, speed, heading } = data;

      // 2. Rate Limiting: Max 1 update per second per bus
      const now = Date.now();
      const lastUpdate = rateLimits.get(String(busId)) || 0;
      if (now - lastUpdate < 1000) {
        // Drop the packet silently to protect DB
        return;
      }
      rateLimits.set(String(busId), now);

      // 3. Validation: Enforce strict GPS bounds
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
        console.warn(`Invalid coordinates received for bus ${busId}: [${lat}, ${lng}]`);
        return;
      }

      // Upsert latest location into the database
      const upsertedLocation = await prisma.busLocation.upsert({
        where: { busId: String(busId) },
        update: {
          latitude: lat,
          longitude: lng,
          speed: speed ? Number(speed) : null,
          heading: heading ? Number(heading) : null,
        },
        create: {
          busId: String(busId),
          latitude: lat,
          longitude: lng,
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
