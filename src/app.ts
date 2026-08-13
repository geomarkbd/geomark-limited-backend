import cors from "cors";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";
import { envVars } from "./app/config/env";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  envVars.FRONTEND_URL,
  ...(envVars.EXTRA_ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()) ?? []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Request Origin:", origin);
      console.log("Allowed Origins:", allowedOrigins);

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Geomark limited System Backend",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
