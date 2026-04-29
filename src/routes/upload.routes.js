import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import * as UploadController from "../controllers/uploads.controller.js"


const router = express.Router();

router.patch('/:bugID', upload.single("image"), UploadController.uploadImage);

export default router