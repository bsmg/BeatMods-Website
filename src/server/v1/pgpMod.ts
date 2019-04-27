import * as express from "express";

import { catchErrors } from "../modules/Utils";
import ModService from "./modules/ModService";

const router = express.Router();

router.get(
    "/",
    catchErrors(async (req, res, next) => {
        const modService = new ModService(req.ctx);
        return res.send(await modService.list(req.query, true));
    })
);

export default router;
