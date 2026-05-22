import { type Request, type Response, type NextFunction } from "express";
import { movieService } from "../services/movie.service";

export const movieController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await movieService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, category, page, limit } = req.validatedQuery as {
        title?: string;
        category?: string;
        page: number;
        limit: number;
      };
      const result = await movieService.findAll(title, category, page, limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: number };
      const [movie] = await movieService.findById(id);
      if (!movie) {
        res.status(404).json({ message: "Película no encontrada" });
        return;
      }
      res.json(movie);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: number };
      const result = await movieService.update(id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: number };
      await movieService.delete(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
