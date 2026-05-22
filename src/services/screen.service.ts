import { screenRepo } from "../repositories/screen.repo";
import { AppError } from "../lib/app-error";

export const screenService = {
  findAll() {
    return screenRepo.findAll();
  },

  async findById(id: number) {
    const [screen] = await screenRepo.findById(id);
    if (!screen) throw new AppError(404, "Sala no encontrada");

    const seats = await screenRepo.getSeats(id);
    return { ...screen, seats };
  },

  create(data: { name: string; totalCapacity: number }) {
    return screenRepo.create(data);
  },

  async update(id: number, data: Partial<{ name: string; totalCapacity: number }>) {
    const [existing] = await screenRepo.findById(id);
    if (!existing) throw new AppError(404, "Sala no encontrada");

    const [screen] = await screenRepo.update(id, data);
    return screen;
  },

  async delete(id: number) {
    const [existing] = await screenRepo.findById(id);
    if (!existing) throw new AppError(404, "Sala no encontrada");

    await screenRepo.delete(id);
  },

  async generateSeats(id: number, rows: number, seatsPerRow: number) {
    const [screen] = await screenRepo.findById(id);
    if (!screen) throw new AppError(404, "Sala no encontrada");

    const inserted = await screenRepo.generateSeats(id, rows, seatsPerRow);
    const capacity = rows * seatsPerRow;
    await screenRepo.update(id, { totalCapacity: capacity });

    return {
      screenId: id,
      totalCapacity: capacity,
      seatsCreated: inserted.length,
      seats: inserted,
    };
  },
};
