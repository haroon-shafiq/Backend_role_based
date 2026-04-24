import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const checkAuth = (req, res, next) => {
    try {
        const token = req.cookies.token;
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

export default checkAuth;