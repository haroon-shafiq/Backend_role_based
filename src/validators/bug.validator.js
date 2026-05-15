import { body } from "express-validator";

export const createBugValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required"),

    body("status")
        .trim()
        .notEmpty()
        .withMessage("Status is required")


]

