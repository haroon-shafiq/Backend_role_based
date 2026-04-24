
import { config } from "dotenv";
config();

export const env = {
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    BASE_URL: process.env.BASE_URL
}