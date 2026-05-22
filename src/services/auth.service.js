import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import ApiError from "../utils/ApiError.js";
import { userSelect } from "../constants/selectors.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.utils.js";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken"

const register = async (registerData) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: registerData.email }
    });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }
    const hashedPassword = await bcrypt.hash(registerData.password, 10);
    const user = await prisma.user.create({
        data: {
            name: registerData.name,
            email: registerData.email,
            password: hashedPassword,
            role: registerData.role
        }
    });
    return { user };
};

const login = async (loginData) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: loginData.email }
    });
    const isPasswordMatched = await bcrypt.compare(loginData.password, existingUser.password);

    if (!isPasswordMatched || !existingUser) {
        throw new ApiError(409, "Invalid Credentials");
    }
    const accessToken = generateAccessToken(existingUser)
    const refreshToken = generateRefreshToken(existingUser)
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await prisma.session.upsert({
        where: {
            userId: existingUser.id
        },
        update: {
            refreshToken,
            expiresAt
        },
        create: {
            refreshToken,
            expiresAt,
            userId: existingUser.id
        }
    })

    const withoutPasswordUser = await prisma.user.findUnique({
        where: { id: existingUser.id },
        select: userSelect
    });

    if (!withoutPasswordUser) {
        throw new ApiError(404, "User not found");
    }

    return { withoutPasswordUser, accessToken, refreshToken };
};

const getUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: userSelect
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return user;
}

const getAllDevelopers = async () => {
    const developers = await prisma.user.findMany({
        where: { role: "DEVELOPER" }
    });
    return developers
}
const getDeveloperByProject = async (projectId) => {
    const developers = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            projectUsers: {
                select: {
                    user: {
                        select: userSelect
                    },
                },
            },
        },
    });
    return developers
}

const refreshToken = async (userId) => {
    const session = await prisma.session.findUnique({
        where: { userId },
    });

    if (!session) {
        throw new ApiError(401, "Session not found, please login again");
    }

    if (session.expiresAt < new Date()) {
        await prisma.session.delete({ where: { userId } });
        throw new ApiError(401, "Session expired, please login again");
    }
    const payload = jwt.verify(session.refreshToken, env.JWT_REFRESH_SECRET);
    const newAccessToken = generateAccessToken(payload);
    console.log("New access token", newAccessToken)

    return newAccessToken;
};
export { register, login, getUser, getAllDevelopers, getDeveloperByProject, refreshToken };