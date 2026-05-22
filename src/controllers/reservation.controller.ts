import { type Request, type Response, type NextFunction } from "express";
import { reservationService } from "../services/reservation.service";

export const reservationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { showtimeId, seatIds } = req.body;
      const userId = req.user!.userId;
      const result = await reservationService.create(userId, showtimeId, seatIds);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async findByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const reservations = await reservationService.findByUser(req.user!.userId);
      res.json(reservations);
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const userId = req.user!.userId;
      const result = await reservationService.cancel(userId, id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
