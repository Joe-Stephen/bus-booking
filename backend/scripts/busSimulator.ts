const { io } = require("socket.io-client");
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../src/utils/jwt";

const prisma = new PrismaClient();

const SERVER_URL = process.env.SOCKET_URL || "ws://localhost:5000";

// A mock route in New York grid
const mockRoute = [
  [40.7128, -74.0060], // Start
  [40.7130, -74.0050],
  [40.7135, -74.0040],
  [40.7140, -74.0030],
  [40.7145, -74.0020],
  [40.7150, -74.0010],
  [40.7155, -74.0000],
  [40.7160, -73.9990],
  [40.7165, -73.9980],
];

async function startSimulation() {
  console.log("Starting Bus Location Simulator...");
  
  // Try to find an existing bus to track
  const bus = await prisma.bus.findFirst({
    where: { isTrackingEnabled: true }
  }) || await prisma.bus.findFirst();

  if (!bus) {
    console.error("No buses found in the database. Please create a bus first.");
    process.exit(1);
  }

  console.log(`Targeting Bus: ${bus.name} (ID: ${bus.id})`);

  // Generate a mock driver token to bypass role-based admission in socket server
  const token = generateToken({ id: `sim-${bus.id}`, role: "DRIVER" });

  const socket = io(SERVER_URL, {
    auth: { token }
  });

  socket.on("connect", () => {
    console.log(`Connected to Socket server at ${SERVER_URL}`);
    console.log("Beginning simulated transmission sequence...");

    let currentIndex = 0;
    
    // Simulate real-time movement updating every 3 seconds
    setInterval(() => {
      // Loop the route endlessly
      if (currentIndex >= mockRoute.length) {
        currentIndex = 0;
      }

      const [latitude, longitude] = mockRoute[currentIndex];
      // Generate some nominal randomized speed (miles per hour)
      const speed = Math.floor(Math.random() * (45 - 20 + 1) + 20);

      const payload = {
        busId: bus.id,
        latitude,
        longitude,
        speed
      };

      socket.emit("bus:location:update", payload);
      console.log(`[SIMULATOR] Transmitted -> Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}, Speed: ${speed}mph`);

      currentIndex++;
    }, 3000);
  });

  socket.on("connect_error", (err: any) => {
    console.error(`Socket connection error: ${err.message}`);
  });
}

startSimulation().catch(console.error);
