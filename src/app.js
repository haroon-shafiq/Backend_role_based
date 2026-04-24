import express from "express";
import routes from "./routes/index.js"
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./config/env.js";

const app = express();
app.use(cors({
    origin: env.BASE_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api', routes)

export default app; 