import { use } from "react";
import * as AuthService from "../services/auth.service.js"
import { sendError, sendSuccess } from "../utils/utils.response.js";
const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return sendError(res, 400, "All fields are required",)
    }

    try {
        const result = await AuthService.register(req.body);
        console.log("Result", result);
        if (result.existingUser) {
            return sendError(res, 409, "User already exists");
        }

        return sendSuccess(res, 201, "User created successfully");

    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return sendError(res, 400, "All fields are required");
    }

    try {
        const result = await AuthService.login(req.body);
        console.log("Result :", result)
        if (!result.withoutPasswordUser) {
            return sendError(res, 404, "User not found");
        }

        if (!result.isPasswordMatched) {
            return sendError(res, 401, "Invalid credentials");
        }


        res.cookie('token', result.token, {
            maxAge: 15 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        });

        return sendSuccess(res, 200, "User logged in successfully", {
            user: {
                id: result.withoutPasswordUser.id,
                name: result.withoutPasswordUser.name,
                email: result.withoutPasswordUser.email,
                role: result.withoutPasswordUser.role
            }
        });

    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
};

const logout = async (req, res) => {
    res.clearCookie('token');
    return sendSuccess(res, 200, "Logged out successfully")
}

const getUser = async (req, res) => {
    try {
        const user = await AuthService.getUser(req.user.id);
        console.log("User", user)
        if (!user) {
            return sendError(res, 404, "User not found");
        }
        console.log("User :", user)
        return sendSuccess(res, 200, "User fetched successfully", user);
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
}

const getAllDevelopers = async (req, res) => {
    try {
        const developers = await AuthService.getAllDevelopers();
        console.log("Developers", developers)
        return sendSuccess(res, 200, "Developers fetched successfully", { developers });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
}
const getDeveloperByProject = async (req, res) => {
    try {
        const developers = await AuthService.getDeveloperByProject(req.params.projectId);
        console.log("Developers", developers)
        return sendSuccess(res, 200, "Developers fetched successfully", { developers });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
}

export { register, login, logout, getUser, getAllDevelopers, getDeveloperByProject }; 