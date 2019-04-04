import express from "express";
import initContext from "./modules/ContextManager";
import modules from "./v1";
import { ServerError } from "./types/error";
import { toObject } from "./modules/Utils";
import cookieParser from 'cookie-parser';
const app = express.Router();

// app.use(express.static(path.join(__dirname, "../../", "build", "static")));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(initContext("beatsaver"));
app.use("/v1", modules);

app.use(function(
  error: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (res.headersSent) {
    return next(error);
  }
  if (error instanceof ServerError || error.prototype instanceof ServerError) {
    res.status(error.httpStatus).send(error);
  } else {
    res.status(500).send(error);
    console.error(`Global error`, {
      error: toObject(error),
      request: {
        originalUrl: req.originalUrl,
        method: req.method,
        headers: req.headers,
        body: req.body,
        ips: req.ips,
        sessionId: req.ctx ? req.ctx.sessionId : null,
        user: req.ctx ? req.ctx.user : null
      }
    });
  }
});
export default app;
