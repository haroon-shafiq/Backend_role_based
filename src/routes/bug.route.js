import { Router } from "express";
import { checkAuth } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/auth.middleware.js";
import * as BugController from "../controllers/bugs.controller.js"
import { upload } from "../middleware/multer.middleware.js";
const router = Router();

router.use(checkAuth);

// router.use(checkRole("QA"));
router.post('/:projectID/create', upload.single('image'), BugController.createBug);
router.get('/:projectID/all-bugs', BugController.getBug);
router.patch('/:bugID/assign', BugController.assignBugToDeveloper)
router.get('/all-bugs', BugController.getAllBugs)
router.get('/:bugID', BugController.getBugById)


export default router;