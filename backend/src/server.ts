import app from "./app";
import prisma from "./config/prisma";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL database ✅");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} 🚀`);
    });
  } catch (error) {
    console.error("Initial database connection error ❌", error);
    process.exit(1);
  }
}

startServer();
