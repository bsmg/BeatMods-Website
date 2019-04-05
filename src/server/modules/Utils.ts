import { RequestHandler, Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";

export const toObject = (obj: any) => Object.getOwnPropertyNames(obj).reduce((a, e) => ((a[e] = obj[e]), a), {});

export const catchErrors = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) =>
    new Promise(resolve => resolve(fn(req, res, next))).catch(err => {
        res.status(500).send(err);
    });

export function toId(id: string | ObjectId) {
    return new ObjectId(id);
}

export function fromId(id: string | ObjectId) {
    if (typeof id === "string") {
        return id;
    }
    return id.toHexString();
}
