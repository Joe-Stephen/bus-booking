"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBus = exports.updateBus = exports.getBuses = exports.createBus = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const createBus = async (req, res) => {
    try {
        const { registrationNo, capacity, features } = req.body;
        const existing = await prisma_1.default.bus.findUnique({ where: { registrationNo } });
        if (existing) {
            res
                .status(400)
                .json({ error: "Bus with this registration number already exists" });
            return;
        }
        const bus = await prisma_1.default.bus.create({
            data: { registrationNo, capacity, features },
        });
        res.status(201).json(bus);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create bus" });
    }
};
exports.createBus = createBus;
const getBuses = async (req, res) => {
    try {
        const buses = await prisma_1.default.bus.findMany();
        res.json(buses);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch buses" });
    }
};
exports.getBuses = getBuses;
const updateBus = async (req, res) => {
    try {
        const { id } = req.params;
        const { registrationNo, capacity, features } = req.body;
        const bus = await prisma_1.default.bus.update({
            where: { id },
            data: { registrationNo, capacity, features },
        });
        res.json(bus);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update bus" });
    }
};
exports.updateBus = updateBus;
const deleteBus = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.default.bus.delete({ where: { id } });
        res.json({ message: "Bus deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete bus" });
    }
};
exports.deleteBus = deleteBus;
