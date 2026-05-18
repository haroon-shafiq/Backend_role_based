import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { userSelect } from "../constants/selectors.js";

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

    const token = jwt.sign(
        {
            id: existingUser.id,
            role: existingUser.role
        },
        env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    const withoutPasswordUser = await prisma.user.findUnique({
        where: { id: existingUser.id },
        select: userSelect
    });

    if (!withoutPasswordUser) {
        throw new ApiError(404, "User not found");
    }

    return { withoutPasswordUser, token };
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

export { register, login, getUser, getAllDevelopers, getDeveloperByProject }; 