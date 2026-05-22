import { Router } from "express";
import { reservationController } from "../controllers/reservation.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createReservationSchema, idParamSchema } from "../schemas";

const router = Router();

router.post("/", authenticate, validate(createReservationSchema), reservationController.create);
router.get("/", authenticate, reservationController.findByUser);
router.patch("/:id/cancel", authenticate, validate(idParamSchema, "params"), reservationController.cancel);

export default router;
