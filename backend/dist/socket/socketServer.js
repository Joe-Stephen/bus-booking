"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const socketHandlers_1 = require("./socketHandlers");
const initializeSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*", // Or appropriately restrict to frontend origin
            methods: ["GET", "POST", "PUT", "DELETE"],
        },
    });
    io.on("connection", socketHandlers_1.handleConnection);
    return io;
};
exports.initializeSocket = initializeSocket;
