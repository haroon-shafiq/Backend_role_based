
import * as AuthService from "../services/auth.service.js"
import { sendSuccess } from "../utils/response.utils.js";
import { catchAsync } from "../utils/catchAsync.js";

const register = catchAsync(async (req, res) => {
    await AuthService.register(req.body);
    return sendSuccess(res, 201, "User created successfully");
});

const login = catchAsync(async (req, res) => {
    const result = await AuthService.login(req.body);
    return sendSuccess(res, 200, "User logged in successfully", {
        user: {
            id: result.withoutPasswordUser.id,
            name: result.withoutPasswordUser.name,
            email: result.withoutPasswordUser.email,
            role: result.withoutPasswordUser.role
        },
        token: result.token
    });
});

const logout = catchAsync(async (req, res) => {
    res.clearCookie('token');
    return sendSuccess(res, 200, "Logged out successfully")
});

const getUser = catchAsync(async (req, res) => {
    const user = await AuthService.getUser(req.user.id);
    return sendSuccess(res, 200, "User fetched successfully", user);
});

const getAllDevelopers = catchAsync(async (req, res) => {
    const developers = await AuthService.getAllDevelopers();
    return sendSuccess(res, 200, "Developers fetched successfully", { developers });
});

const getDeveloperByProject = catchAsync(async (req, res) => {
    const developers = await AuthService.getDeveloperByProject(req.params.projectId);
    return sendSuccess(res, 200, "Developers fetched successfully", { developers });
});

export { register, login, logout, getUser, getAllDevelopers, getDeveloperByProject }; 