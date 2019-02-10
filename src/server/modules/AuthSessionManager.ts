import { Request, Response, NextFunction } from 'express';
import { compareSync } from 'bcrypt';

import { ServerError } from '../types/error';
import AuthTokenService, { TokenInfo } from './AuthTokenService';
import UserDAO, { IRedactedDbUser } from './dao/UserDAO';
import { IDbUser } from './dao/UserDAO';

declare global {
  export interface ISessionUser
    extends Pick<IRedactedDbUser, 'name' | 'email' | 'lastLogin'> {
    _id: string;
  }
}
export interface ISessionOptions {
  refreshCookieName?: string;
  authService?: AuthTokenService;
  responseHeader?: string;
}

export default class AuthSessionManager {
  constructor(options: ISessionOptions = {}) {
    this.refreshCookieName = options.refreshCookieName || 'refresh_token';
    this.authService = options.authService || new AuthTokenService();
    this.responseHeader = options.responseHeader || 'X-ACCESS-TOKEN';
  }
  private refreshCookieName: string;
  private authService: AuthTokenService;
  private responseHeader: string;

  public injectAuthUser() {
    return async function(
      this: AuthSessionManager,
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      try {
        const db = req.ctx.db;
        let authToken = '';
        if (
          req.headers &&
          req.headers.authorization &&
          typeof req.headers.authorization === 'string'
        ) {
          const parts = req.headers.authorization.split(' ');
          if (parts.length === 2) {
            const scheme = parts[0];
            const credentials = parts[1];
            if (/^Bearer$/i.test(scheme)) {
              authToken = credentials;
            }
          }
        }
        if (!authToken) {
          return next();
        }
        const refreshTokenId: string = req.cookies[this.refreshCookieName];

        const tokenInfo = await this.authService.validateTokens(
          db,
          authToken,
          refreshTokenId
        );
        if (!tokenInfo) {
          return next();
        }

        this.applyAuthSession(req, tokenInfo);
        if (tokenInfo.isNew) {
          this.sendTokensToClient(res, tokenInfo);
        }
        next();
      } catch (ex) {
        next(ex);
      }
    }.bind(this);
  }

  public signIn() {
    return async function(
      this: AuthSessionManager,
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      try {
        const db = req.ctx.db;
        const userDao = new UserDAO(db);
        const user = await userDao.getWithPassword({
          email: req.body.username
        });
        if (!user || !compareSync(req.body.password, user.passwordHash)) {
          return next(new SignInError());
        }
        delete user.passwordHash;
        user.lastLogin = new Date(); // apply to the object so it gets picked up in the claims
        await userDao.update(user._id, { lastLogin: user.lastLogin });

        const claims = this.extractClaims(user);
        const tokenInfo = await this.authService.generateTokens(
          db,
          req.ctx.appName,
          user._id.toHexString(),
          claims
        );
        this.applyAuthSession(req, tokenInfo);
        this.sendTokensToClient(res, tokenInfo);
        res.send(user);
      } catch (ex) {
        next(ex);
      }
    }.bind(this);
  }

  public signOff() {
    return async function(
      this: AuthSessionManager,
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      try {
        const db = req.ctx.db;
        res.clearCookie(this.refreshCookieName);
        if (req.ctx.sessionId) {
          await this.authService.removeSessionTokens(
            db,
            req.ctx.appName,
            req.ctx.sessionId
          );
        }
        res.send();
      } catch (ex) {
        next(ex);
      }
    }.bind(this);
  }

  private extractClaims(user: IDbUser) {
    if (!user._id) {
      throw new Error();
    }
    const claims: ISessionUser = {
      _id: user._id.toHexString(),
      email: user.email,
      name: user.name,
      lastLogin: user.lastLogin
    };
    return claims;
  }

  private applyAuthSession(req: Request, tokenInfo: TokenInfo) {
    req.ctx.sessionId = tokenInfo.sessionId;
    req.ctx.user = tokenInfo.claims as ISessionUser;
  }

  private sendTokensToClient(res: Response, tokenInfo: TokenInfo) {
    res.cookie(this.refreshCookieName, tokenInfo.refreshTokenId, {
      maxAge: this.authService.refreshTokenLifetime * 1000,
      httpOnly: true
    });
    res.setHeader(this.responseHeader, tokenInfo.accessToken);
  }
}

export class SignInError extends ServerError {
  constructor() {
    super('server.auth.invalid_credentials', [], 400);
  }
}
