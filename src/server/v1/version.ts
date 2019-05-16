import * as express from "express";

import { catchErrors } from "../modules/Utils";
// @ts-ignore
import { gameVersions } from "../../config/lists";

const router = express.Router();

router.get(
    "/",
    catchErrors(async (req, res, next) => {
        return res.send(gameVersions);
    })
);

export default router;
