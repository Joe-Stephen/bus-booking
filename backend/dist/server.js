"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./config/prisma"));
const http_1 = __importDefault(require("http"));
const socketServer_1 = require("./socket/socketServer");
const PORT = process.env.PORT || 5000;
async function startServer() {
    try {
        await prisma_1.default.$connect();
        console.log("Connected to PostgreSQL database ✅");
        const server = http_1.default.createServer(app_1.default);
        // Initialize Socket.io on top of the HTTP Server
        const io = (0, socketServer_1.initializeSocket)(server);
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} 🚀`);
        });
    }
    catch (error) {
        console.error("Initial database connection error ❌", error);
        process.exit(1);
    }
}
startServer();
