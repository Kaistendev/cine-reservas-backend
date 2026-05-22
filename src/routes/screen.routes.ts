import { Router } from "express";
import { screenController } from "../controllers/screen.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import {
  createScreenSchema,
  updateScreenSchema,
  generateSeatsSchema,
  idParamSchema,
} from "../schemas";

const router = Router();

router.get("/", screenController.findAll);
router.get("/:id", validate(idParamSchema, "params"), screenController.findById);
router.post("/", authenticate, authorize("ADMIN"), validate(createScreenSchema), screenController.create);
router.put("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), validate(updateScreenSchema), screenController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), screenController.delete);
router.post("/:id/seats", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), validate(generateSeatsSchema), screenController.generateSeats);

export default router;
