import { Request, Response, NextFunction } from "express";
import { compareSync } from "bcrypt";

import { ServerError, ParameterError } from "../../types/error";
import AuthTokenService, { TokenInfo } from "./AuthTokenService";
import UserDAO, { IRedactedDbUser } from "./dao/UserDAO";
import { IDbUser } from "./dao/UserDAO";
import UserService from "../v1/modules/UserService";
import { toId } from "./Utils";
import AuditLogService from "../v1/modules/AuditLogService";

declare global {
    export interface ISessionUser extends Pick<IRedactedDbUser, "username" | "email" | "lastLogin" | "admin"> {
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
        this.refreshCookieName = options.refreshCookieName || "refresh_token";
        this.authService = options.authService || new AuthTokenService();
        this.responseHeader = options.responseHeader || "X-ACCESS-TOKEN";
    }
    private refreshCookieName: string;
    private authService: AuthTokenService;
    private responseHeader: string;

    public injectAuthUser() {
        return async function(this: AuthSessionManager, req: Request, res: Response, next: NextFunction) {
            try {
                const db = req.ctx.db;
                let authToken = "";
                if (req.headers && req.headers.authorization && typeof req.headers.authorization === "string") {
                    const parts = req.headers.authorization.split(" ");
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

                const tokenInfo = await this.authService.validateTokens(db, authToken, refreshTokenId);
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

    public register() {
        return async function(this: AuthSessionManager, req: Request, res: Response, next: NextFunction) {
            const userService = new UserService(req.ctx);

            const username = req.body.username;
            const email = req.body.email;
            const password = req.body.password;
            if (!username || typeof username !== "string") {
                throw new ParameterError("username");
            }
            if (!email || typeof email !== "string") {
                throw new ParameterError("email");
            }
            if (!password || typeof password !== "string") {
                throw new ParameterError("password");
            }

            const user = await userService.create(username, email, password);
            return res.send(user);
        }.bind(this);
    }

    private getRegex(param: string) {
        return {
            $regex: `${decodeURIComponent(param).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")}`,
            $options: "i"
        };
    }
    public signIn() {
        return async function(this: AuthSessionManager, req: Request, res: Response, next: NextFunction) {
            const db = req.ctx.db;
            const userDao = new UserDAO(db);
            const user = await userDao.getWithPassword({
                ...("username" in req.body ? { username: this.getRegex(req.body.username) } : null),
                ...("email" in req.body ? { email: this.getRegex(req.body.email) } : null)
            });

            if (!user || !compareSync(req.body.password, user.passwordHash)) {
                throw new SignInError();
            }
            delete user.passwordHash;
            user.lastLogin = new Date(); // apply to the object so it gets picked up in the claims
            await userDao.update(user._id, { lastLogin: user.lastLogin });

            const claims = this.extractClaims(user);
            const tokenInfo = await this.authService.generateTokens(db, req.ctx.appName, user._id.toHexString(), claims);
            this.applyAuthSession(req, tokenInfo);
            this.sendTokensToClient(res, tokenInfo);
            new AuditLogService(req.ctx).create(user as any, "LOGIN", "USER", {}, {});

            res.send(user);
        }.bind(this);
    }

    public signOff() {
        return async function(this: AuthSessionManager, req: Request, res: Response, next: NextFunction) {
            try {
                new AuditLogService(req.ctx).create(req.ctx.user, "LOGOUT", "USER", {}, {});
                const db = req.ctx.db;
                res.clearCookie(this.refreshCookieName);
                if (req.ctx.sessionId) {
                    await this.authService.removeSessionTokens(db, req.ctx.appName, req.ctx.sessionId);
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
            _id: toId(user._id).toHexString(),
            email: user.email,
            username: user.username,
            lastLogin: user.lastLogin,
            admin: user.admin
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
        super("server.auth.invalid_credentials", [], 400);
    }
}
