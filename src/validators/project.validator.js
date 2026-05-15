import { body } from "express-validator";

export const createProjectValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Project name is required"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Project description is required"),
]
export const assignDeveloperToProjectValidator = [
    body("developerID")
        .trim()
        .notEmpty()
        .withMessage("Developer ID is required"),
    body("projectID")
        .trim()
        .notEmpty()
        .withMessage("Project ID is required"),
]