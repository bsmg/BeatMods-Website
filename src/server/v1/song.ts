import * as express from "express";

import { catchErrors } from "../modules/Utils";
import SongService from "./modules/SongService";

const router = express.Router();

router.post(
  "/",
  catchErrors(async (req, res, next) => {
    const songService = new SongService(req.ctx);
    const user = await songService.get(req.params.id);
    return res.send(user);
  })
);

router.get(
  "/",
  catchErrors(async (req, res, next) => {
    const songService = new SongService(req.ctx);
    return res.send(await songService.list());
  })
);

router.get(
  "/:_id",
  catchErrors(async (req, res, next) => {
    const songService = new SongService(req.ctx);
    const user = await songService.get(req.params._id);
    return res.send(user);
  })
);

export default router;
