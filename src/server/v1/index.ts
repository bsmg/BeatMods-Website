import * as express from "express";

import AuthTokenService from "../modules/AuthTokenService";
import AuthSessionManager from "../modules/AuthSessionManager";
import { checkAuthorization } from "../modules/AuthManager";
import config from "../config";
import userRouter from "./user";
import modRouter from "./mod";

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

router.post("/signIn", authSessionManager.signIn());
router.post("/signOut", authSessionManager.signOff());
router.post("/register", authSessionManager.register());
router.use(
    checkAuthorization().unless({
        path: [{ url: "/api/v1/mod", methods: ["GET"] }, { url: "/api/v1/user", methods: ["GET"] }, "/api/v1/user/current", "/api/v1/user/create"]
    })
);
router.use("/mod", modRouter);
router.use("/user", userRouter);

export default router;
