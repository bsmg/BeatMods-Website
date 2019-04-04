import { Request, Response, NextFunction } from "express";
import { Db, MongoClient } from "mongodb";
import config from "../config";

declare global {
    export interface ISessionUser {}
    export interface IContext {
        appName: string;
        db: Db;
        sessionId: string;
        user: ISessionUser;
    }
    namespace Express {
        export interface Request {
            ctx: IContext;
        }
    }
}

let _db: Db;
const dbPoolsAwaiter = Promise.resolve(
    MongoClient.connect(config.mongo.uri, {
        useNewUrlParser: true
    }).then(client => client.db())
)
    .then(db => {
        _db = db;
    })
    .catch(err => {
        console.error("Failed to make all database connections!");
        console.error(err);
        process.exit(1);
    });

class Context implements IContext {
    constructor(public appName: string, public db: Db) {}
    public sessionId: string;
    public user: ISessionUser;
}

export default function initContext(appName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (_db) {
            req.ctx = new Context(appName, _db);
            return next();
        }
        dbPoolsAwaiter.then(() => {
            req.ctx = new Context(appName, _db);
            next();
        });
    };
}
