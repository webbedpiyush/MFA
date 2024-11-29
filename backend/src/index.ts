import express, { Request, Response } from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "./config/app.config";
import connectDatabase from "./database/database";
import { errorHandler } from "./middlewares/errorHandler";
import { HttpStatus } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler";
import authRouter from "./modules/auth/auth.routes";

const app = express();
const BASE_PATH = config.BASE_PATH;
console.log(BASE_PATH)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.APP_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(HttpStatus.OK).json({
      message: "heelo world",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRouter);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(
    `Server listening on the port ${config.PORT} in ${config.NODE_ENV}`
  );
  await connectDatabase();
});
