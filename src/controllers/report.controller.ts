import { type Request, type Response, type NextFunction } from "express";
import { reportService } from "../services/report.service";

export const reportController = {
  async revenue(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to } = req.query as { from?: string; to?: string };
      const result = await reportService.revenue(from, to);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async occupancy(req: Request, res: Response, next: NextFunction) {
    try {
      const { movie_id, from, to } = req.query as {
        movie_id?: string;
        from?: string;
        to?: string;
      };
      const result = await reportService.occupancy({
        ...(movie_id ? { movie_id: Number(movie_id) } : {}),
        from,
        to,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async movieDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await reportService.movieDetail(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
