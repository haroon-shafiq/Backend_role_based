import { Router } from "express";
import * as ProjectController from "../controllers/projects.controller.js"
import { checkAuth, checkRole } from "../middleware/auth.middleware.js";


const router = Router();

// router.use(checkAuth);
// const managerRoleMiddleware = checkRole("MANAGER");
// const allRolesMiddleware = checkRole("MANAGER", "DEVELOPER", "QA");

router.post('/create', checkAuth, ProjectController.createProject);
router.get('/', checkAuth, ProjectController.getProject)
router.post('/:projectID/assign-developer', checkAuth, ProjectController.assignDeveloperToProject)
router.get("/getAllProjects", checkAuth, ProjectController.getAllProjects)
router.get("/my-projects", checkAuth, ProjectController.getProjectIdByDeveloper)
router.delete("/:projectID", checkAuth, ProjectController.deleteProject)
router.get('/inviteAccept/', checkAuth, ProjectController.acceptInvite)

export default router
