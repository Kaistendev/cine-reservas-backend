import { type Request, type Response, type NextFunction } from "express";
import { reservationService } from "../services/reservation.service";

export const adminController = {
  async findAllReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await reservationService.findAll(page, limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
