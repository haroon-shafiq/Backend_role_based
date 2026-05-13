import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const INVITE_SECRET = env.INVITE_TOKEN_SECRET;
const INVITE_EXPIRES_IN = "24h";
const INVITE_EXPIRES_MS = 24 * 60 * 60 * 1000;

export const generateInviteToken = ({ developerID, projectID }) => {
    const token = jwt.sign(
        { developerID, projectID },
        INVITE_SECRET,
        { expiresIn: INVITE_EXPIRES_IN }
    );

    const expiry = new Date(Date.now() + INVITE_EXPIRES_MS);

    return { token, expiry };
};

export const decodeInviteToken = (token) => {
    console.log("Token", token);
    try {
        return { payload: jwt.verify(token, INVITE_SECRET) };
    } catch (error) {
        if (error.name === "TokenExpiredError") return { expired: true };
        return { invalid: true };
    }
};