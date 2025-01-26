import { Router } from "express";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";
import { mfaControlller } from "./mfa.module";

const mfaRouter = Router();

mfaRouter.get("/setup", authenticateJWT, mfaControlller.generateMFASetup);
mfaRouter.post("/verify", authenticateJWT, mfaControlller.verifyMFASetup);
mfaRouter.put("/revoke", authenticateJWT, mfaControlller.revokeMFA);
mfaRouter.post("/verify-login", authenticateJWT, mfaControlller.verifyMFAForLogin);

export default mfaRouter;
