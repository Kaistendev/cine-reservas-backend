import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authSchema } from "../schemas";

const router = Router();

router.post("/register", validate(authSchema), authController.register);
router.post("/login", validate(authSchema), authController.login);

export default router;
