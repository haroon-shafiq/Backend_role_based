import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        console.log("Token :", token);
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const payload = jwt.verify(token, env.JWT_SECRET);
        console.log("Payload :", payload);
        req.user = payload;
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
export const checkRole = (...roles) => {
    console.log("Roles from checkRole:", roles);
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    }
}
