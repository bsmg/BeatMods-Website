import { ParameterError } from "../../../types/error";
import { toId } from "../../modules/Utils";
import { IDbMod } from "../models";
import path from "path";
import AdmZip from "adm-zip";
import md5File from "md5-file";
import ModDAO from "../../modules/dao/ModDAO";

export default class ModService {
    constructor(protected ctx: IContext) {
        this.dao = new ModDAO(this.ctx.db);
    }
    protected dao: ModDAO;

    public async insert(mod: IDbMod) {
        if (mod._id) {
            return null;
        }
        const _id = await this.dao.insert(mod as any);
        return { _id, ...mod } as IDbMod;
    }

    public async get(_id: string | Id) {
        return (await this.dao.get(toId(_id))[0]) as (IDbMod | null);
    }

    public async remove(_id: string | Id) {
        return await this.dao.remove(_id);
    }

    private getRegex(param: string) {
        return {
            $regex: `${decodeURIComponent(param).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")}`,
            $options: "i"
        };
    }
    public async list(params?: any) {
        const query: dynamic = {};
        if (params && Object.keys(params).length) {
            if (params.search && params.search.length) {
                query.$or = [
                    { name: this.getRegex(params.search) },
                    { description: this.getRegex(params.search) },
                    { "author.username": this.getRegex(params.search) },
                    { hashMd5: this.getRegex(params.search) }
                ];
            }
            if (params.status && params.status.length) {
                if (Array.isArray(params.status)) {
                    query.status = { $in: params.status };
                } else {
                    query.status = params.status;
                }
            }
        }
        const cursor = await this.dao.list(Object.keys(query).length ? query : undefined);

        const mods = await cursor.toArray();
        if (this.ctx.user && this.ctx.user._id) {
            const personalCursor = await this.dao.list({
                authorId: toId(this.ctx.user._id),
                status: { $ne: "approved" }
            });
            const personalMods = await personalCursor.toArray();
            for (const mod of personalMods) {
                if (mods.filter(m => m._id === mod._id).length === 0) {
                    mods.push(mod);
                }
            }
        }
        return mods.map(mod => mod as IDbMod);
    }

    public async update(mod: IDbMod) {
        if (!mod._id) {
            throw new ParameterError("mod._id");
        }
        if (Object.keys(mod).length === 0) {
            return {};
        }
        if (mod.dependencies && typeof mod.dependencies === "string") {
            mod.dependencies = (await this.dao.getDependencies(mod.dependencies)).map(item => toId(item._id));
        }
        mod.updatedDate = new Date();
        return (await this.dao.update(toId(mod._id), mod)) as IDbMod;
    }

    public async create(user: ISessionUser, name: string, description: string, version: string, dependencies: string, link: string, file: Express.Multer.File | null) {
        if (file) {
            const zip = new AdmZip(file.buffer);
            const _dependencies = await this.dao.getDependencies(dependencies);
            const mod: IDbMod = {
                name,
                description: description || "",
                authorId: toId(user._id),
                version,
                link,
                updatedDate: new Date(),
                uploadDate: new Date(),
                status: "pending",
                dependencies: _dependencies.map(m => m._id)
            };
            const { _id } = (await this.insert(mod)) as IDbMod & { _id: Id };
            mod._id = toId(_id);
            const filename = path.join(process.cwd(), "uploads", _id.toString(), `${name}-${version}.zip`);
            zip.writeZip(filename);
            mod.hashMd5 = md5File.sync(filename);
            await this.update(mod);
        }
        return true;
    }
}
