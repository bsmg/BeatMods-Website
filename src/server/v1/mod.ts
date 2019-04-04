import * as express from "express";

import { catchErrors } from "../modules/Utils";
import ModService from "./modules/ModService";

import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ limits: { fileSize: 6 * 1024 * 1024 }, storage });

const router = express.Router();

router.get(
  "/",
  catchErrors(async (req, res, next) => {
    const modService = new ModService(req.ctx);
    console.log(JSON.stringify(req.headers));
    return res.send((await modService.list(req.query)).map(mod => ({...mod, download_url: `${req.protocol}://${req.headers['Host']||req.hostname}/uploads/${mod._id}/${mod.name}-${mod.version}.zip`})));
  })
);


router.post(
  "/create",
  upload.single("file"),
  catchErrors(async (req, res, next) => { 
    const file = "file" in req && req.file ? req.file : null;
    
    const modService = new ModService(req.ctx);
    const user = await modService.create(req.ctx.user, req.body.name ||"", req.body.description ||"", req.body.version ||"", req.body.dependencies ||"", req.body.link || "", file);
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
    const mod = await modService.update({...req.body, _id: req.params._id});
    return res.send(mod);
  })
);

export default router;
