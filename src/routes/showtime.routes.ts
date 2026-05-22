import { Router } from "express";
import { showtimeController } from "../controllers/showtime.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import {
  createShowtimeSchema,
  updateShowtimeSchema,
  showtimeQuerySchema,
  idParamSchema,
} from "../schemas";

const router = Router();

router.get("/", validate(showtimeQuerySchema, "query"), showtimeController.findAll);
router.get("/:id", validate(idParamSchema, "params"), showtimeController.findById);
router.post("/", authenticate, authorize("ADMIN"), validate(createShowtimeSchema), showtimeController.create);
router.put("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), validate(updateShowtimeSchema), showtimeController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), showtimeController.delete);
router.get("/:id/seats", validate(idParamSchema, "params"), showtimeController.getSeats);

export default router;
