const { io } = require("socket.io-client");
import { PrismaClient } from "@prisma/client";
import { generateToken } from "../src/utils/jwt";

const prisma = new PrismaClient();

const SERVER_URL = process.env.SOCKET_URL || "ws://localhost:5000";

// A mock route in Kochi grid
const mockRoute = [
  [10.004542, 76.375369], // Start 10.004542, 76.375369
  [10.004528, 76.37508], //10.004528, 76.375080
  [10.004522, 76.374902], //10.004522, 76.374902
  [10.004514, 76.374734], //10.004514, 76.374734
  [10.004476, 76.374464], //10.004476, 76.374464
  [10.004447, 76.374244], //10.004447, 76.374244
  [10.004683, 76.374136], //10.004683, 76.374136
  [10.005007, 76.374179], //10.005007, 76.374179
  [10.005037, 76.37378], //10.005037, 76.373780
];

async function startSimulation() {
  console.log("Starting Bus Location Simulator...");

  // Try to find an existing bus to track
  const bus =
    (await prisma.bus.findFirst({
      where: { isTrackingEnabled: true },
    })) || (await prisma.bus.findFirst());

  if (!bus) {
    console.error("No buses found in the database. Please create a bus first.");
    process.exit(1);
  }

  console.log(`Targeting Bus: ${bus.name} (ID: ${bus.id})`);

  // Generate a mock driver token to bypass role-based admission in socket server
  const token = generateToken({ id: `sim-${bus.id}`, role: "DRIVER" });

  const socket = io(SERVER_URL, {
    auth: { token },
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
        speed,
      };

      socket.emit("bus:location:update", payload);
      console.log(
        `[SIMULATOR] Transmitted -> Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}, Speed: ${speed}mph`,
      );

      currentIndex++;
    }, 3000);
  });

  socket.on("connect_error", (err: any) => {
    console.error(`Socket connection error: ${err.message}`);
  });
}

startSimulation().catch(console.error);
