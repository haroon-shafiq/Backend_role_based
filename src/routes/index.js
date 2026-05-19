import { Router } from "express";
import authRouter from "./auth.route.js";
import projectRouter from "./project.route.js"
import bugRouter from "./bug.route.js"
import uploadRouter from "../routes/upload.routes.js"
import activityRouter from "./activity.route.js"



const router = Router();

router.use('/v1/auth', authRouter)
router.use('/v2/projects', projectRouter)
router.use('/v3/bugs', bugRouter)
router.use('/v4/upload', uploadRouter)
router.use('/v1', activityRouter)


export default router;