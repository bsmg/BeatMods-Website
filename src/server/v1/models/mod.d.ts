import { user } from "./user";
import UserDAO from "modules/dao/UserDAO";

export interface IDbMod {
    _id?: Id;
    name: string;
    authorId: Id;
    version: string;
    uploadDate: Date;
    updatedDate: Date;
    description: string;
    dependencies: Id[];
    link: string;
    status: IModStatus;
    category: string;
    downloads?: { type: string; url: string; hashMd5: { hash: string; file: string }[] }[];
}
export type mod = IMod & { _id: Id };

export interface IMod {
    _id: string;
    name: string;
    authorId: string;
    author: user;
    version: string;
    uploadDate: Date;
    updatedDate: Date;
    description: string;
    dependencies: IDBMod[];
    link: string;
    status: IModStatus;
    category: string;
    downloads?: { type: string; url: string; hashMd5: { hash: string; file: string }[] }[];
}
export type IModStatus = "pending" | "approved" | "declined" | "inactive";
