import * as express from "express";

import AuthTokenService from "../modules/AuthTokenService";
import AuthSessionManager from "../modules/AuthSessionManager";
import { checkAuthorization } from "../modules/AuthManager";
import config from "../config";
import userRouter from "./user";

const authTokenService = new AuthTokenService({
  alg: config.jwt.alg,
  publicKey: config.jwt.publicKey,
  privateKey: config.jwt.privateKey
});
const authSessionManager = new AuthSessionManager({
  authService: authTokenService
});
const router = express.Router();
router.use(authSessionManager.injectAuthUser());
router.get("/test", (req, res) => {
  res.send({ valid: true });
});
router.post("/signIn", authSessionManager.signIn());
router.get("/signOut", authSessionManager.signOff());
router.use(checkAuthorization());
router.use("/user", userRouter);

export default router;
