import * as express from "express";

import { catchErrors } from "../modules/Utils";
import ModService from "./modules/ModService";

import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 }, storage });

const router = express.Router();

router.get(
    "/",
    catchErrors(async (req, res, next) => {
        const modService = new ModService(req.ctx);
        return res.send(await modService.list(req.query));
    })
);

router.post(
    "/create",
    upload.array("file"),
    catchErrors(async (req, res, next) => {
        const files = ("files" in req && req.files ? req.files : []) as Express.Multer.File[];

        const modService = new ModService(req.ctx);
        const user = await modService.create(
            req.ctx.user,
            req.body.name || "",
            req.body.description || "",
            req.body.version || "",
            req.body.gameVersion || "",
            req.body.dependencies || "",
            req.body.category || "",
            req.body.link || "",
            files
        );
        return res.send(user);
    })
);

router.get(
    "/:_id",
    catchErrors(async (req, res, next) => {
        const modService = new ModService(req.ctx);
        const mod = await modService.get(req.params._id);
        return res.send(mod);
    })
);

router.post(
    "/:_id",
    catchErrors(async (req, res, next) => {
        const modService = new ModService(req.ctx);
        const mod = await modService.update({ ...req.body, _id: req.params._id });
        return res.send(mod);
    })
);

export default router;
