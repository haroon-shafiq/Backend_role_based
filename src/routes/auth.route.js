import { Router } from "express";
import { register, login, logout, getUser, getAllDevelopers, getDeveloperByProject } from "../controllers/auth.controller.js";
import { checkAuth } from "../middleware/auth.middleware.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import { validate } from "../middleware/validation.middleware.js";

const router = Router();

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.post('/logout', logout)
router.get('/me', checkAuth, getUser)
router.get('/developers', getAllDevelopers);
router.get('/developers/:projectId', getDeveloperByProject);

export default router; 