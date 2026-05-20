import { body, param } from "express-validator";
import { BUG_TYPE, BUG_STATUS } from "../constants/enums.js";

export const createBugValidator = [
    param("projectID")
        .notEmpty()
        .withMessage("Project ID is required"),

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Title must be 3-100 characters"),

    body("description")
        .trim()
        .optional()
        .isLength({ max: 500 })
        .withMessage("Description max 500 characters"),

    body("status")
        .isIn(BUG_STATUS)
        .withMessage("Invalid status"),

    body("type")
        .isIn(BUG_TYPE)
        .withMessage("Type must be BUG or FEATURE"),

    body("developerID")
        .optional()
];

export const updateBugValidator = [
    param("bugId")
        .notEmpty()
        .withMessage("Bug ID is required"),

]
