import { Request, Response } from "express";
import prisma from "../../config/prisma";

export const createRoute = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { origin, destination, distance, duration } = req.body;

    // Simple check if route exists, optional
    const existing = await prisma.route.findFirst({
      where: { origin, destination },
    });

    if (existing) {
      res.status(400).json({ error: "This route already exists" });
      return;
    }

    const route = await prisma.route.create({
      data: { origin, destination, distance, duration },
    });

    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ error: "Failed to create route" });
  }
};

export const getRoutes = async (req: Request, res: Response): Promise<void> => {
  try {
    // Both ADMIN and USER can see routes conceptually, but depends on requirements
    const routes = await prisma.route.findMany();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch routes" });
  }
};

export const updateRoute = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { origin, destination, distance, duration } = req.body;

    const route = await prisma.route.update({
      where: { id: String(id) },
      data: { origin, destination, distance, duration },
    });

    res.json(route);
  } catch (error) {
    res.status(500).json({ error: "Failed to update route" });
  }
};

export const deleteRoute = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.route.delete({ where: { id: String(id) } });
    res.json({ message: "Route deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete route" });
  }
};
