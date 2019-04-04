import * as express from "express";

import { catchErrors } from "../modules/Utils";
import UserService from "./modules/UserService";
import { ParameterError } from "../../types/error";

const router = express.Router();

router.get(
    "/",
    catchErrors(async (req, res, next) => {
        const userService = new UserService(req.ctx);
        return res.send(await userService.list());
    })
);

router.post(
    "/create",
    catchErrors(async (req, res, next) => {
        const userService = new UserService(req.ctx);
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        if (!username || typeof username !== "string") {
            throw new ParameterError("username");
        }
        if (!email || typeof email !== "string") {
            throw new ParameterError("email");
        }
        if (!password || typeof password !== "string") {
            throw new ParameterError("password");
        }

        const user = await userService.create(username, email, password);
        return res.send(user);
    })
);

router.get(
    "/current",
    catchErrors(async (req, res, next) => {
        if (!req.ctx.user || !req.ctx.user._id) {
            return res.send({});
        }

        const userService = new UserService(req.ctx);
        const user = await userService.get(req.ctx.user._id);
        return res.send(user);
    })
);

router.post(
    "/changePassword",
    catchErrors(async (req, res, next) => {
        if (!req.ctx.user || !req.ctx.user._id) {
            return res.send();
        }
        const current = req.body.current;
        const password = req.body.password;
        if (!current || typeof current !== "string") {
            throw new ParameterError("current");
        }
        if (!password || typeof password !== "string") {
            throw new ParameterError("password");
        }

        const userService = new UserService(req.ctx);
        await userService.changePassword(req.ctx.user._id, current, password);
        return res.send();
    })
);

router.get(
    "/:_id",
    catchErrors(async (req, res, next) => {
        const userService = new UserService(req.ctx);
        const user = await userService.get(req.params._id);
        return res.send(user);
    })
);

export default router;
