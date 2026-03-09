"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./config/prisma"));
const PORT = process.env.PORT || 5000;
async function startServer() {
    try {
        await prisma_1.default.$connect();
        console.log("Connected to PostgreSQL database ✅");
        app_1.default.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} 🚀`);
        });
    }
    catch (error) {
        console.error("Initial database connection error ❌", error);
        process.exit(1);
    }
}
startServer();
