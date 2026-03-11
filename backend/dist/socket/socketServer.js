"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const socketHandlers_1 = require("./socketHandlers");
const jwt_1 = require("../utils/jwt");
const initializeSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*", // Or appropriately restrict to frontend origin
            methods: ["GET", "POST", "PUT", "DELETE"],
        },
    });
    // Authentication Middleware
    io.use((socket, next) => {
        try {
            // The token can be passed in auth payload: socket.io(url, { auth: { token: "..." } })
            const token = socket.handshake.auth?.token;
            if (token) {
                const decoded = (0, jwt_1.verifyToken)(token);
                socket.data.user = decoded; // Attach user payload so handlers can check roles
            }
        }
        catch (error) {
            console.log(`Socket auth failed for ${socket.id}, proceeding as anonymous listener.`);
            // We don't return next(new Error(...)) because passengers might connect unauthenticated just to listen
        }
        next();
    });
    io.on("connection", (socket) => {
        (0, socketHandlers_1.handleConnection)(socket, io);
    });
    return io;
};
exports.initializeSocket = initializeSocket;
