import { Db } from "mongodb";
import uuid from "uuid/v4";
import * as jwt from "jsonwebtoken";

import RefreshTokenDAO from "./dao/RefreshTokenDAO";

export interface IAuthOptions {
    alg?: string;
    publicKey?: Buffer | string;
    privateKey?: Buffer | string;
    softAccessTokenLifetime?: number;
    accessTokenLifetime?: number;
    refreshTokenLifetime?: number;
    verifyOptions?: jwt.VerifyOptions;
    signOptions?: jwt.SignOptions;
}

export interface IClaims {
    [key: string]: any;
}

export interface IJWT {
    header: IJWTHeader;
    payload: IJWTPayload;
    signature: string;
}
export interface IJWTHeader {
    alg: string;
    typ: string;
}
export interface IJWTPayload extends IClaims {
    // Our mandatory
    jti: string;
    iat: number;
    exp: number;
    sub: string;
    // Our custom
    refreshTokenId: string;
    sessionId: string;
}

export class TokenInfo {
    constructor(public sessionId: string, public accessToken: string, public refreshTokenId: string, public claims: IClaims, public isNew: boolean = false) {}
}

export default class AuthTokenService {
    constructor(options?: IAuthOptions) {
        options = options || {};
        this.alg = options.alg || "HS256";
        this.publicKey = options.publicKey || "shared-secret";
        this.privateKey = options.privateKey || "shared-secret";
        this.accessTokenLifetime = options.accessTokenLifetime || 5 * 60;
        this.softAccessTokenLifetime = options.softAccessTokenLifetime || 10;
        this.refreshTokenLifetime = options.refreshTokenLifetime || 30 * 60;
        this.verifyOptions = options.verifyOptions || {};
        this.signOptions = options.signOptions || {};
    }
    private readonly alg: string;
    private readonly publicKey: Buffer | string;
    private readonly privateKey: Buffer | string;
    public readonly softAccessTokenLifetime: number;
    public readonly accessTokenLifetime: number;
    public readonly refreshTokenLifetime: number;
    protected readonly verifyOptions: jwt.VerifyOptions;
    protected readonly signOptions: jwt.SignOptions;

    public async generateTokens(db: Db, app: string, subject: string, claims: IClaims) {
        const sessionId = uuid();
        const jwtId = uuid();
        const refreshTokenId = uuid();
        const now = new Date();
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + this.refreshTokenLifetime);

        const refreshTokenDAO = new RefreshTokenDAO(db);
        await refreshTokenDAO.insert({
            refreshTokenId,
            jwtId: jwtId,
            sub: subject,
            sessionId: sessionId,
            app: app,
            created: now,
            issued: now,
            expires: expires
        });
        const _claims = { ...claims, sessionId, refreshTokenId };
        const accessToken = jwt.sign(_claims, this.privateKey, {
            algorithm: this.alg,
            subject: subject,
            jwtid: jwtId,
            expiresIn: this.accessTokenLifetime
        });
        return new TokenInfo(sessionId, accessToken, refreshTokenId, claims, true);
    }

    public async useRefreshToken(db: Db, payload: IJWTPayload, oldRefreshTokenId: string) {
        const subject = payload.sub;
        const jwtId = uuid();
        const refreshTokenId = uuid();
        const now = new Date();
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + this.refreshTokenLifetime);

        const updateMatch = {
            refreshTokenId: oldRefreshTokenId,
            jwt: payload.jwt,
            sessionId: payload.sessionId,
            sub: payload.sub,
            expires: { $gt: now }
        };
        const commands = {
            $set: {
                refreshTokenId,
                jwtId: jwtId,
                issued: now,
                expires: expires,
                previousId: oldRefreshTokenId
            },
            $push: { renewals: { id: oldRefreshTokenId, renewed: now } }
        };

        const refreshTokenDAO = new RefreshTokenDAO(db);
        if ((await refreshTokenDAO.write(updateMatch, commands, {})) !== 1) {
            // If refresh token was not updated then it means we didn't have valid information.
            return null;
        }

        // obtain shallow copy of payload without the jwt specific fields
        const claims = this.extractClaims(payload);
        claims.refreshTokenId = refreshTokenId;
        const accessToken = jwt.sign(claims, this.privateKey, {
            algorithm: this.alg,
            subject: subject,
            jwtid: jwtId,
            expiresIn: this.accessTokenLifetime
        });
        return { accessToken, refreshTokenId };
    }

    public async validateTokens(db: Db, authToken: string, refreshTokenId: string) {
        try {
            const verified = jwt.verify(authToken, this.publicKey, this.verifyOptions) as IJWTPayload;
            if (typeof verified === "string") {
                return null;
            }
            const verifiedClaims = this.extractClaims(verified);
            // For extra protection against XSS attacks we also want the refresh token to match.
            if (verifiedClaims.refreshTokenId !== refreshTokenId) {
                console.debug("Verified tokenId mismatch", verifiedClaims, refreshTokenId);
                return null;
            }
            return new TokenInfo(verified.sessionId, authToken, refreshTokenId, verifiedClaims, false);
        } catch (jwtErr) {
            // Kick out if completely invalid token
            if (!(jwtErr instanceof jwt.TokenExpiredError)) {
                console.debug("Invalid auth token", authToken, jwtErr);
                return null;
            }
        }

        const payload = jwt.decode(authToken) as IJWTPayload;
        if (typeof payload === "string") {
            console.debug("Invalid auth token type", authToken);
            return null;
        }
        const claims = this.extractClaims(payload);

        // Only generate new token pairs when refresh and access tokens match
        // There is a race condition on the client when it receives the new token
        // pairs via different methods (cookie vs headers).  New refresh token
        // may be sent with an old expired access token... We don't want to generate
        // another new pair
        if (payload.refreshTokenId === refreshTokenId) {
            // Attempt to continue the session with new token pair
            const newTokens = await this.useRefreshToken(db, payload, refreshTokenId);
            if (newTokens) {
                return new TokenInfo(payload.sessionId, newTokens.accessToken, newTokens.refreshTokenId, claims, true);
            }
        } else {
            // This code handles the situation when the refresTokenId doesn't match the one indicated in the access token
            // Normally this is invalid.  However, in the race condition described above.. the refresTokenId should match
            // the one in the database
        }

        // There can be concurrent requests using an expired access token or periods where the
        // client is still awaiting/setting up the new access token and refresh token pair.
        // One and only one of these request will find the refresh token and grenerate a new pair.
        // In all other cases we will allow a small window where the pair will be accepted
        // provided the pair was previously valid

        // If no refresh token found with the current session then they have logged out.
        const refreshTokenDAO = new RefreshTokenDAO(db);
        const currentToken = await refreshTokenDAO.find({
            sessionId: payload.sessionId,
            expires: { $gt: new Date() }
        });
        if (!currentToken) {
            console.debug("No unexpired refresh token for session", payload.sessionId);
            return null;
        }

        // If the new refresh token is older than the soft window then the request is invalid
        // The client really should have received and sent the new access token by now.
        const secondsSinceNewToken = (new Date().getTime() - currentToken.issued.getTime()) / 1000;
        if (secondsSinceNewToken > this.softAccessTokenLifetime) {
            console.debug("Current refresh token older than soft token lifetime", secondsSinceNewToken, this.softAccessTokenLifetime);
            return null;
        }

        // If the refreshTokenId matches the previousId on the new token then it's likely it was a concurrent request
        // started before the other request finished and updated the tokens on the client
        // If the refreshTokenId matches the current refreshTokenId then we likely dealing with the client race condition
        // and we will allow it... for now.
        if (refreshTokenId !== currentToken.previousId && refreshTokenId !== currentToken.refreshTokenId) {
            console.debug("Refresh token mismatch", refreshTokenId, currentToken.previousId, currentToken.refreshTokenId);
            return null;
        }

        return new TokenInfo(payload.sessionId, authToken, refreshTokenId, payload, false);
    }

    public async removeSessionTokens(db: Db, app: string, sessionId: string) {
        const refreshTokenDAO = new RefreshTokenDAO(db);
        await refreshTokenDAO.delete({ app, sessionId });
    }

    public async removeUserTokens(db: Db, app: string, sub: string) {
        const refreshTokenDAO = new RefreshTokenDAO(db);
        await refreshTokenDAO.delete({ app, sub });
    }

    public extractClaims(payload: IJWTPayload) {
        const claims = Object.assign({}, payload);
        delete claims.sub;
        delete claims.exp;
        delete claims.iat;
        delete claims.jti;
        return claims as IClaims;
    }
}
