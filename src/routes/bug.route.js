import { Router } from "express";
import { checkAuth, checkRole } from "../middleware/auth.middleware.js";
import * as BugController from "../controllers/bugs.controller.js"
import * as NotificationController from "../controllers/activity.controller.js"
import { upload, uploadToCloudinary } from "../middleware/multer.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { createBugValidator } from "../validators/bug.validator.js";



// import { createBugValidator } from "../validators/bug.validator.js";
const router = Router();

router.use(checkAuth);

// router.use(checkRole("QA"));

router.post('/:projectID/create', checkRole("QA"), upload.single('image'), uploadToCloudinary, createBugValidator, validate, BugController.createBug);
router.patch('/:bugId', BugController.updateBugs)
router.get('/:projectID/all-bugs', BugController.getBug);
router.patch('/:bugID/assign', checkRole("QA"), BugController.assignBugToDeveloper)
router.get('/all-bugs', BugController.getAllBugs)
router.get('/:bugID', BugController.getBugById)
router.get('/:projectId/get-bugs', BugController.getBugByProjectId)
router.delete('/:bugID', BugController.deleteBug)
router.patch('/:bugID/status', BugController.updateStatus)



export default router;