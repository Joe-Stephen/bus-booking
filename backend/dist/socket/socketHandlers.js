"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConnection = void 0;
const handleConnection = (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
};
exports.handleConnection = handleConnection;
