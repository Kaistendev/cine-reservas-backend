import { Router } from "express";
import { reportController } from "../controllers/report.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import {
  revenueQuerySchema,
  occupancyQuerySchema,
  idParamSchema,
} from "../schemas";

const router = Router();

router.get("/revenue", authenticate, authorize("ADMIN"), validate(revenueQuerySchema, "query"), reportController.revenue);
router.get("/occupancy", authenticate, authorize("ADMIN"), validate(occupancyQuerySchema, "query"), reportController.occupancy);
router.get("/movies/:id", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), reportController.movieDetail);

export default router;
