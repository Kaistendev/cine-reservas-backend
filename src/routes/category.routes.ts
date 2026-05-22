import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
  idParamSchema,
} from "../schemas";

const router = Router();

router.get("/", validate(categoryQuerySchema, "query"), categoryController.findAll);
router.get("/:id", validate(idParamSchema, "params"), categoryController.findById);
router.post("/", authenticate, authorize("ADMIN"), validate(createCategorySchema), categoryController.create);
router.put("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), validate(updateCategorySchema), categoryController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), validate(idParamSchema, "params"), categoryController.delete);

export default router;
