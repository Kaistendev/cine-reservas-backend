import { type Request, type Response, type NextFunction } from "express";
import { categoryService } from "../services/category.service";

export const categoryController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.validatedQuery as { page: number; limit: number };
      const result = await categoryService.findAll(page, limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: number };
      const cat = await categoryService.findById(id);
      res.json(cat);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const [cat] = await categoryService.create(name);
      res.status(201).json(cat);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: number };
      const { name } = req.body;
      const cat = await categoryService.update(id, name);
      res.json(cat);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validatedParams as { id: number };
      await categoryService.delete(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
