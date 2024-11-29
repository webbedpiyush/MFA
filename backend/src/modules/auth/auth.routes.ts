import { Router } from "express";
import { authController } from "./auth.module";

const authRouter = Router();

authRouter.post("/register", authController.register);

export default authRouter;
