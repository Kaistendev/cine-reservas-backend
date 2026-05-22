import { type Request, type Response, type NextFunction } from "express";
import { screenService } from "../services/screen.service";

export const screenController = {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const screens = await screenService.findAll();
      res.json(screens);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const screen = await screenService.findById(id);
      res.json(screen);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, totalCapacity } = req.body;
      const [screen] = await screenService.create({ name, totalCapacity });
      res.status(201).json(screen);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { name, totalCapacity } = req.body;
      const screen = await screenService.update(id, { name, totalCapacity });
      res.json(screen);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await screenService.delete(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async generateSeats(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { rows, seatsPerRow } = req.body;
      const result = await screenService.generateSeats(id, rows, seatsPerRow);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },
};
