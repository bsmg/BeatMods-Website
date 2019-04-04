import { Db, CommonOptions, DeleteWriteOpResultObject } from "mongodb";
import BaseDAO, { IBaseDAO } from "./BaseDAO";

export interface IDbRefreshToken {
    _id?: Id;
    refreshTokenId: string;
    sub: string;
    sessionId: string;
    app: string | null;
    jwtId: string;
    created: Date;
    issued: Date;
    expires: Date;
    previousId?: string;
    renewals?: {
        id: string;
        renewed: Date;
    }[];
}
export interface IRefreshTokenDAO extends IBaseDAO<IDbRefreshToken> {
    delete(filter: dynamic, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
}

export default class RefreshTokenDAO extends BaseDAO<IDbRefreshToken> implements IRefreshTokenDAO {
    constructor(db: Db) {
        super("refreshToken", db);
    }

    public async delete(filter: dynamic, options?: CommonOptions) {
        return await this.collection.deleteOne(filter, options);
    }
}
