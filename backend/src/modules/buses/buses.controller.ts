import { Request, Response } from "express";
import prisma from "../../config/prisma";

export const createBus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, totalSeats } = req.body;

    const existing = await prisma.bus.findFirst({ where: { name } });
    if (existing) {
      res
        .status(400)
        .json({ error: "Bus with this name already exists" });
      return;
    }

    const bus = await prisma.bus.create({
      data: { name, totalSeats },
    });

    res.status(201).json(bus);
  } catch (error) {
    res.status(500).json({ error: "Failed to create bus" });
  }
};

export const getBuses = async (req: Request, res: Response): Promise<void> => {
  try {
    const buses = await prisma.bus.findMany();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch buses" });
  }
};

export const updateBus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, totalSeats } = req.body;

    const bus = await prisma.bus.update({
      where: { id: String(id) },
      data: { name, totalSeats },
    });

    res.json(bus);
  } catch (error) {
    res.status(500).json({ error: "Failed to update bus" });
  }
};

export const deleteBus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.bus.delete({ where: { id: String(id) } });
    res.json({ message: "Bus deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete bus" });
  }
};
