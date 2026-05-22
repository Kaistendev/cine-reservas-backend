import { Router } from "express";
import { movieController } from "../controllers/movie.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import {
  createMovieSchema,
  updateMovieSchema,
  movieQuerySchema,
  idParamSchema,
} from "../schemas";

const router = Router();

router.get("/", validate(movieQuerySchema, "query"), movieController.findAll);
router.get("/:id", validate(idParamSchema, "params"), movieController.findById);
router.post("/", authenticate, authorize("ADMIN"), validate(createMovieSchema), movieController.create);
router.put("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), validate(updateMovieSchema), movieController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), movieController.delete);

export default router;
