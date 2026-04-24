import { Router } from "express";
import authRouter from "./auth.route.js";

const router = Router();

router.use('/v1/auth', authRouter)


export default router;