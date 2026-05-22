
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { catchAsync } from "../utils/catchAsync.js";

export const checkAuth = catchAsync(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No access token" });
    }

    try {
        const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
        const session = payload.id;
        console.log("Session======>>>>>>", session)
        if (!session) {
            return res.status(401).json({ message: "Session expired Please login again" })
        }
        req.user = payload;

        next();
    } catch (err) {
        console.error("Error,,,,", err)
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired" });
        }
        return res.status(401).json({ message: "Invalid token" });
    }
});

export const checkRole = (...roles) => {
    return catchAsync(async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    });
};