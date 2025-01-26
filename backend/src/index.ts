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
import passport from "./middlewares/passport";
import { authenticateJWT } from "./common/strategies/jwt.strategy";
import { sessionRouter } from "./modules/session/session.routes";
import mfaRouter from "./modules/mfa/mfa.routes";

const app = express();
const BASE_PATH = config.BASE_PATH;
console.log(BASE_PATH);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.APP_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(passport.initialize());

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    res.status(HttpStatus.OK).json({
      message: "heelo world",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRouter);
app.use(`${BASE_PATH}/mfa`, mfaRouter);
app.use(`${BASE_PATH}/session`, authenticateJWT, sessionRouter);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(
    `Server listening on the port ${config.PORT} in ${config.NODE_ENV}`
  );
  await connectDatabase();
});
