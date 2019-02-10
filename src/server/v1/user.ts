import * as express from 'express';

import { catchErrors } from '../modules/Utils';
import UserService from './modules/UserService';
import { ParameterError } from '../types/error';

const router = express.Router();

router.post(
  '/',
  catchErrors(async (req, res, next) => {
    const userService = new UserService(req.ctx);
    const user = await userService.get(req.params.id);
    return res.send(user);
  })
);

router.get(
  '/create',
  catchErrors(async (req, res, next) => {
    const userService = new UserService(req.ctx);
    const user = await userService.createUser(req.query.password);
    return res.send(user);
  })
);

router.get(
  '/',
  catchErrors(async (req, res, next) => {
    const userService = new UserService(req.ctx);
    return res.send(await userService.list());
  })
);

router.get(
  '/current',
  catchErrors(async (req, res, next) => {
    if (!req.ctx.user || !req.ctx.user._id) {
      return res.send();
    }

    const userService = new UserService(req.ctx);
    const user = await userService.get(req.ctx.user._id);
    return res.send(user);
  })
);

router.post(
  '/changePassword',
  catchErrors(async (req, res, next) => {
    if (!req.ctx.user || !req.ctx.user._id) {
      return res.send();
    }
    const current = req.body.current;
    const password = req.body.password;
    if (!current || typeof current !== 'string') {
      throw new ParameterError('current');
    }
    if (!password || typeof password !== 'string') {
      throw new ParameterError('password');
    }

    const userService = new UserService(req.ctx);
    await userService.changePassword(req.ctx.user._id, current, password);
    return res.send();
  })
);

router.get(
  '/:_id',
  catchErrors(async (req, res, next) => {
    const userService = new UserService(req.ctx);
    const user = await userService.get(req.params._id);
    return res.send(user);
  })
);

export default router;
