import { categoryRepo } from "../repositories/category.repo";
import { AppError } from "../lib/app-error";

export const categoryService = {
  findAll(page = 1, limit = 20) {
    return categoryRepo.findAll(page, limit);
  },

  async findById(id: number) {
    const [cat] = await categoryRepo.findById(id);
    if (!cat) throw new AppError(404, "Categoría no encontrada");
    return cat;
  },

  create(name: string) {
    return categoryRepo.create(name);
  },

  async update(id: number, name: string) {
    const [existing] = await categoryRepo.findById(id);
    if (!existing) throw new AppError(404, "Categoría no encontrada");

    const [cat] = await categoryRepo.update(id, name);
    return cat;
  },

  async delete(id: number) {
    const [existing] = await categoryRepo.findById(id);
    if (!existing) throw new AppError(404, "Categoría no encontrada");

    await categoryRepo.delete(id);
  },
};
