import { user } from "./user";
import UserDAO from "modules/dao/UserDAO";

export interface IAuditLog {
    _id?: Id;
    type: IAuditLogType;
    userId: Id;
    objectType: IAuditLogObjectType;
    changeFrom: dynamic;
    changeTo: dynamic;
    date: Date;
}

export type IAuditLogType = "UPDATE" | "INSERT" | "LOGIN" | "LOGOUT";
export type IAuditLogObjectType = "MOD" | "USER";
