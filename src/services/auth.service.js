import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (registerData) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: registerData.email }
    });

    if (existingUser) {
        return { existingUser };
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

    if (!existingUser) {
        return { existingUser: null, isPasswordMatched: false };
    }

    const isPasswordMatched = await bcrypt.compare(loginData.password, existingUser.password);

    if (!isPasswordMatched) {
        return { existingUser, isPasswordMatched: false };
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
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });

    return { withoutPasswordUser, isPasswordMatched: true, token };
};

const getUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });
    return user

}

export { register, login, getUser }; 