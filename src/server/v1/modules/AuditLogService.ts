import { ParameterError } from "../../../types/error";
import { toId } from "../../modules/Utils";
import AuditLogDAO from "../../modules/dao/AuditLogDAO";
import { IAuditLog, IAuditLogType, IAuditLogObjectType } from "../../v1/models/audit_log";

export default class AuditLogService {
    constructor(protected ctx: IContext) {
        this.dao = new AuditLogDAO(this.ctx.db);
    }
    protected dao: AuditLogDAO;

    public async insert(log: IAuditLog) {
        if (log._id) {
            return null;
        }
        const _id = await this.dao.insert(log as any);
        return { _id, ...log } as IAuditLog;
    }

    public async get(_id: string | Id) {
        return (await this.dao.get(toId(_id))[0]) as (IAuditLog | null);
    }

    public async remove(_id: string | Id) {
        return await this.dao.remove(_id);
    }

    public async update(auditLog: IAuditLog) {
        if (!auditLog._id) {
            throw new ParameterError("auditLog._id");
        }
        return (await this.dao.update(toId(auditLog._id), auditLog)) as IAuditLog;
    }

    public async create(user: ISessionUser, type: IAuditLogType, objectType: IAuditLogObjectType, changeFrom: dynamic, changeTo: dynamic) {
        const auditLog: IAuditLog = {
            userId: toId(user._id),
            type,
            objectType,
            changeFrom,
            changeTo,
            date: new Date()
        };

        await this.insert(auditLog);
        return true;
    }
}
