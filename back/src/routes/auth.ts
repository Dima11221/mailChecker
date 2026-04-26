import { Router } from "express";
import {login, logout, me} from "../controllers/auth";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
