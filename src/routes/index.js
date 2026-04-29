import { Router } from "express";
import authRouter from "./auth.route.js";
import projectRouter from "./project.route.js"
import bugRouter from "./bug.route.js"
import uploadRouter from "../routes/upload.routes.js"

const router = Router();

router.use('/v1/auth', authRouter)
router.use('/v2/projects', projectRouter)
router.use('/v3/bugs', bugRouter)
router.use('/v4/upload', uploadRouter)


export default router;