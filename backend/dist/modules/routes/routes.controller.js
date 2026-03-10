"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoute = exports.updateRoute = exports.getRoutes = exports.createRoute = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createRoute = async (req, res) => {
    try {
        const { source, destination, distance } = req.body;
        // Simple check if route exists, optional
        const existing = await prisma_1.default.route.findFirst({
            where: { source, destination },
        });
        if (existing) {
            res.status(400).json({ error: "This route already exists" });
            return;
        }
        const route = await prisma_1.default.route.create({
            data: { source, destination, distance },
        });
        res.status(201).json(route);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create route" });
    }
};
exports.createRoute = createRoute;
const getRoutes = async (req, res) => {
    try {
        // Both ADMIN and USER can see routes conceptually, but depends on requirements
        const routes = await prisma_1.default.route.findMany();
        res.json(routes);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch routes" });
    }
};
exports.getRoutes = getRoutes;
const updateRoute = async (req, res) => {
    try {
        const { id } = req.params;
        const { source, destination, distance } = req.body;
        const route = await prisma_1.default.route.update({
            where: { id: String(id) },
            data: { source, destination, distance },
        });
        res.json(route);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update route" });
    }
};
exports.updateRoute = updateRoute;
const deleteRoute = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.route.delete({ where: { id: String(id) } });
        res.json({ message: "Route deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete route" });
    }
};
exports.deleteRoute = deleteRoute;
