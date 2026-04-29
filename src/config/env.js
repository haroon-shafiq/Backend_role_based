
import { config } from "dotenv";
config();

export const env = {
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    BASE_URL: process.env.BASE_URL,
    CLOUD_NAME: process.env.CLOUD_NAME,
    API_KEY: process.env.API_KEY,
    API_SECRET: process.env.API_SECRET
}