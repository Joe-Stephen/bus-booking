import { Request, Response } from "express";
import prisma from "../../config/prisma";

export const createRoute = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { source, destination, distance } = req.body;

    // Simple check if route exists, optional
    const existing = await prisma.route.findFirst({
      where: { source, destination },
    });

    if (existing) {
      res.status(400).json({ error: "This route already exists" });
      return;
    }

    const route = await prisma.route.create({
      data: { source, destination, distance },
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
    const { source, destination, distance } = req.body;

    const route = await prisma.route.update({
      where: { id: String(id) },
      data: { source, destination, distance },
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
