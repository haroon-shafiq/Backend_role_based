import { Router } from "express";
import { checkAuth } from "../middleware/auth.middleware.js";
import * as activityController from "../controllers/activity.controller.js"


const router = Router();

router.use(checkAuth);

router.get('/notifications', activityController.getAllActivity)


export default router;