import { Router } from "express";
import { checkAuth, checkRole } from "../middleware/auth.middleware.js";
import * as BugController from "../controllers/bugs.controller.js"
import { upload } from "../middleware/multer.middleware.js";
const router = Router();

router.use(checkAuth);

// router.use(checkRole("QA"));

router.post('/:projectID/create', upload.single('image'), BugController.createBug);
router.patch('/:bugId', BugController.updateBugs)
router.get('/:projectID/all-bugs', BugController.getBug);
router.patch('/:bugID/assign', BugController.assignBugToDeveloper)
router.get('/all-bugs', BugController.getAllBugs)
router.get('/:bugID', BugController.getBugById)
router.delete('/:bugID', BugController.deleteBug)
router.patch('/:bugID/status', BugController.updateStatus)



export default router;