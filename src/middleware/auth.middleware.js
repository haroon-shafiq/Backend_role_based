import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { catchAsync } from "../utils/catchAsync.js";

export const checkAuth = catchAsync(async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    next();
});

export const checkRole = (...roles) => {
    return catchAsync(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    });
}
