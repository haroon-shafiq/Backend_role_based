import jwt from "jsonwebtoken";
import { INVITE_EXPIRES_MS, INVITE_EXPIRES_IN, INVITE_SECRET, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../constants/enums.js";
import { env } from "../config/env.js";

export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        env.JWT_ACCESS_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
}

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        env.JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
}

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
    try {
        return { payload: jwt.verify(token, INVITE_SECRET) };
    } catch (error) {
        if (error.name === "TokenExpiredError") return { expired: true };
        return { invalid: true };
    }
};
