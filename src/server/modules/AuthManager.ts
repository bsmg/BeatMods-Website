import * as express from 'express';
import * as unless from 'express-unless';

import { ServerError } from '../types/error';

export interface RequestHandler extends express.RequestHandler {
  unless?: typeof unless;
}

export class AuthenticationError extends ServerError {
  constructor() {
    super('server.auth.not_authenticated', [], 401);
  }
}
export class AuthorizationError extends ServerError {
  constructor(data?: string[]) {
    super('server.auth.not_authorized', data, 403);
  }
}

export function checkAuthorization() {
  const middleware = <RequestHandler> function(req, res, next) {
    if (!req.ctx.user) {
      return next(new AuthenticationError());
    }
    next();
  };
  middleware.unless = unless;
  return middleware;
}

export const permissions = {
  VIEW_PROFILE: true
};
