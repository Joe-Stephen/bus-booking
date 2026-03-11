import app from "./app";
import prisma from "./config/prisma";
import http from "http";
import { initializeSocket } from "./socket/socketServer";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL database ✅");

    const server = http.createServer(app);
    	
    // Initialize Socket.io on top of the HTTP Server
    const io = initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} 🚀`);
    });
  } catch (error) {
    console.error("Initial database connection error ❌", error);
    process.exit(1);
  }
}

startServer();
