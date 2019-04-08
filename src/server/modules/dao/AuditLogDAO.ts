import { Db } from "mongodb";
import BaseDAO, { IBaseDAO } from "./BaseDAO";
import { IAuditLog } from "../../v1/models/audit_log";

export interface IAutidLogDAO extends IBaseDAO<IAuditLog> {}

export default class AutidLogDAO extends BaseDAO<IAuditLog> implements IAutidLogDAO {
    constructor(db: Db) {
        super("audit_log", db);
    }
}
