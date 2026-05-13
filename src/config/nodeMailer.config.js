import nodemailer from "nodemailer";
import { env } from "./env.js";
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS
    }
})
transporter.verify((error, success) => {
    if (error) {
        console.error("Error in creating the transporter", error);
    }
    else {
        console.log("Successfully created the transporter", success)
    }
})