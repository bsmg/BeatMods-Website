import * as express from "express";

import { catchErrors } from "../modules/Utils";
import SongService from "./modules/SongService";

import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ limits: { fileSize: 6 * 1024 * 1024 }, storage });

const router = express.Router();

router.post(
  "/",
  catchErrors(async (req, res, next) => {
    const songService = new SongService(req.ctx);
    const song = await songService.get(req.params.id);
    return res.send(song);
  })
);

router.get(
  "/",
  catchErrors(async (req, res, next) => {
    const songService = new SongService(req.ctx);
    return res.send(await songService.list(req.query));
  })
);

router.post(
  "/create",
  upload.single("file"),
  catchErrors(async (req, res, next) => { 
    const file = "file" in req && req.file ? req.file : null;
    const songService = new SongService(req.ctx);
    const user = await songService.create(req.ctx.user, file);
    return res.send(user);
  })
);

router.get(
  "/:_id",
  catchErrors(async (req, res, next) => {
    const songService = new SongService(req.ctx);
    const song = await songService.get(req.params._id);
    return res.send(song);
  })
);

export default router;
