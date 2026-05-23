import { Router } from "express";
import { adminController } from "../controllers/admin.controller";

const router = Router();

router.get("/reservations", adminController.findAllReservations);

export default router;
