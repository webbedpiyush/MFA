import { Router } from "express";
import { authController } from "./auth.module";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.get("/refresh", authController.refreshToken);
authRouter.post("/verify/email", authController.verifyEmail);
authRouter.post("/password/forgot", authController.forgotPassword);
authRouter.post("/password/reset", authController.resetPassword);

export default authRouter;
