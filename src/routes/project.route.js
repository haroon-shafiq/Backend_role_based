import { Router } from "express";
import * as ProjectController from "../controllers/projects.controller.js"
import { checkAuth, checkRole } from "../middleware/auth.middleware.js";


const router = Router();

router.use(checkAuth);
// const managerRoleMiddleware = checkRole("MANAGER");
// const allRolesMiddleware = checkRole("MANAGER", "DEVELOPER", "QA");

router.post('/create', ProjectController.createProject);
router.get('/', ProjectController.getProject)
router.post('/:projectID/assign-developer', ProjectController.assignDeveloperToProject)
router.get("/getAllProjects", ProjectController.getAllProjects)
router.get("/my-projects", ProjectController.getProjectIdByDeveloper)
router.delete("/:projectID", ProjectController.deleteProject)

export default router
