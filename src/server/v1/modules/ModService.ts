import { ParameterError, ServerError } from "../../../types/error";
import { toId } from "../../modules/Utils";
import { IDbMod } from "../models";
import ModDAO from "../../modules/dao/ModDAO";
const md5 = require("md5");
import fs from "fs";
import path from "path";
const StreamZip = require("node-stream-zip");
import AuditLogService from "./AuditLogService";
import DiscordManager from "../../modules/DiscordManager";

function sanitizePathComponent(component: string) {
    // Shorten the component to 64 characters, which leaves plenty for the rest of the path
    component = component.slice(0, 64);
    const replacement = (s: string) => "_".repeat(s.length);
    // Replace any characters other than letters, numbers, " ", "-", "_", or "." with "_"
    // Allowing "." is a bit dangerous, but it's always part of the version.
    // This should be safe on any modern filesystem.
    return (
        component
            .replace(/[^a-zA-Z0-9\-_. ]/g, replacement)
            // Replace any leading "."s with "_"
            .replace(/^\.+/, replacement)
            // Replace any trailing "."s with "_"
            .replace(/\.+$/, replacement)
            // Replace any groups of "." with "_"
            .replace(/\.\.+/g, replacement)
    );
}

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
        new AuditLogService(this.ctx).create(this.ctx.user, "INSERT", "MOD", {}, mod);
        new DiscordManager().sendWebhook(
            `${this.ctx.user.username} uploaded ${mod.name} v${mod.version}`,
            Object.keys(mod)
                .filter(i => i === "description")
                .map(i => ({ name: i, value: mod[i] })) as dynamic[],
            "https://beatmods.com"
        );

        return { _id, ...mod } as IDbMod;
    }
    public async find(query: dynamic) {
        return (await this.dao.find(query)[0]) as (IDbMod | null);
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
        let sort: dynamic | undefined;
        if (params && Object.keys(params).length) {
            if (params.search && params.search.length) {
                query.$or = [{ name: this.getRegex(params.search) }, { description: this.getRegex(params.search) }, { "author.username": this.getRegex(params.search) }];
            }
            if (params.hash && params.hash.length) {
                query["downloads.hashMd5.hash"] = params.hash;
            }
            if (params.gameversion && params.gameversion.length) {
                params.gameVersion = params.gameversion;
                delete params.gameversion;
            }
            const fields = { category: "category", status: "status", name: "name", version: "version", gameVersion: "gameVersion", author: "author.username" };
            for (const field in fields) {
                if (params[field] && params[field].length) {
                    if (Array.isArray(params[field])) {
                        query[fields[field]] = { $in: params[field] };
                    } else {
                        query[fields[field]] = this.getRegex(params[field]);
                    }
                }
            }
            if (params.sort) {
                sort = { [params.sort]: Number(params.sortDirection || 1), required: 1 };
            }
        }
        const cursor = await this.dao.list(Object.keys(query).length ? query : undefined, sort ? { sort } : undefined);

        const mods = await cursor.toArray();
        if (this.ctx.user && this.ctx.user._id && !this.ctx.user.admin) {
            const personalCursor = await this.dao.list({
                authorId: toId(this.ctx.user._id),
                status: { $nin: ["approved", "inactive"] }
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

    public async update(changes: IDbMod, isInsert = false) {
        if (!changes._id) {
            throw new ParameterError("mod._id");
        }
        const existing = await this.dao.get(toId(changes._id));
        if (!this.ctx.user || (!this.ctx.user.admin && toId(existing.authorId).toHexString() !== toId(this.ctx.user._id).toHexString())) {
            throw new ServerError("mod.no_permissions");
        }

        if (!isInsert) {
            if (!this.ctx.user.admin && existing.status === "approved") {
                throw new ParameterError("mod.auth_required_post_approval");
            }
            const baseEditProps = new Set(["description", "link", "dependencies"]);
            const modEditProps = new Set(["name", "version", "gameVersion", "status", "required", "category"]);
            for (const prop of Object.keys(changes)) {
                const val = changes[prop];
                if (typeof val !== "string" && typeof val !== "boolean" && !(val instanceof String) && !(val instanceof Boolean)) {
                    // Might be an attempt at MongoDB injection
                    throw new ParameterError("mod.illegal_value_type");
                }
                if (baseEditProps.has(prop)) {
                    // If they can edit anything, they can edit this
                } else if (modEditProps.has(prop)) {
                    if (!this.ctx.user.admin) {
                        throw new ParameterError(`mod.auth_required.${prop}`);
                    }
                } else if (prop !== "_id") {
                    // "_id" will get deleted in a bit anyway
                    throw new ParameterError("mod.illegal_property");
                }
            }
        }
        if (Object.keys(changes).length === 0) {
            return new ParameterError(`mod.no_properties_updated`);
        }
        changes["updatedDate"] = new Date();
        if (changes.dependencies && typeof changes.dependencies === "string") {
            changes.dependencies = (await this.dao.getDependencies(changes.dependencies)).map(item => toId(item._id));
        }
        if (changes.status && changes.status === "approved") {
            const older = await this.dao.getOldVersions(existing);
            for (const oldMod of older) {
                if (oldMod.status === "inactive" || oldMod.status === "declined") {
                    // Nothing to do, this status is fine.
                } else {
                    const newStatus = oldMod.status === "approved" ? "inactive" : "declined";
                    await this.dao.update(toId(oldMod._id), { status: newStatus });
                }
            }
        }
        if (changes["_id"]) {
            delete changes["_id"];
        }
        new AuditLogService(this.ctx).create(
            this.ctx.user,
            "UPDATE",
            "MOD",
            {
                ...Object.keys(changes)
                    .map(k => ({ [k]: existing[k] }))
                    .reduce((acc, cur, i) => ({ ...acc, ...cur }), {})
            },
            changes
        );
        if (Object.keys(changes).indexOf("status") !== -1 && !isInsert) {
            const newStatus = changes.status;
            new DiscordManager().sendWebhook(`${this.ctx.user.username} ${newStatus} ${existing.name} v${existing.version}`, [], "https://beatmods.com");
            // } else if (!isInsert) {
            //     new DiscordManager().sendWebhook(
            //         `${this.ctx.user.username} updated ${existing.name} v${existing.version}`,
            //         Object.keys(changes)
            //             .filter(i => i !== "updatedDate" && i !== "dependencies")
            //             .map(i => ({ name: i, value: changes[i] })) as dynamic[],
            //         "https://beatmods.com"
            //     );
        }
        return (await this.dao.update(toId(existing._id), changes)) as IDbMod;
    }

    public async create(
        user: ISessionUser,
        name: string,
        description: string,
        version: string,
        gameVersion: string,
        dependencies: string,
        category: string,
        link: string,
        files: Express.Multer.File[]
    ) {
        const existing = await this.find({ name, version });
        if (existing) {
            throw new ParameterError("mod.duplicate_upload");
        }
        if (files) {
            const _dependencies = await this.dao.getDependencies(dependencies);
            const mod: IDbMod = {
                name,
                description: description || "",
                authorId: toId(user._id),
                version,
                gameVersion,
                link,
                updatedDate: new Date(),
                uploadDate: new Date(),
                status: "pending",
                downloads: [],
                category: category || "Other",
                required: false,
                dependencies: _dependencies.map(m => m._id)
            };
            const { _id } = (await this.insert(mod)) as IDbMod & { _id: Id };
            mod._id = toId(_id);
            let index = 0;
            for (const file of files) {
                const type = files.length === 1 ? "universal" : index === 0 ? "steam" : "oculus";
                const filePath = `/uploads/${_id.toString()}/${type}/`;
                const fileName = sanitizePathComponent(`${name}-${version}`) + ".zip";
                const fullPath = path.join(process.cwd(), filePath);
                const fullFile = path.join(fullPath, fileName);
                try {
                    await new Promise((res, rej) => {
                        const mkdir = (dirPath: string, root = "") => {
                            const dirs = dirPath.split(path.sep);
                            const dir = dirs.shift();
                            root = (root || "") + dir + path.sep;

                            try {
                                fs.mkdirSync(root);
                            } catch (e) {
                                if (!fs.statSync(root).isDirectory()) {
                                    throw new Error(e);
                                }
                            }

                            return !dirs.length || mkdir(dirs.join(path.sep), root);
                        };
                        mkdir(fullPath);
                        fs.writeFile(fullFile, file.buffer, { flag: "w" }, () => {
                            res();
                        });
                    });
                } catch (err) {
                    console.error("ModService.create", "ZIP Write", err);
                    throw new ServerError("mod.upload.zip.create");
                }
                try {
                    const md5Hashes: { hash: string; file: string }[] = [];
                    await new Promise((res, rej) => {
                        const zip = new StreamZip({
                            file: fullFile,
                            storeEntries: true
                        });
                        zip.on("ready", () => {
                            for (const entry of Object.values(zip.entries()) as any[]) {
                                if (entry.isDirectory) {
                                    continue;
                                }
                                try {
                                    const data = zip.entryDataSync(entry);
                                    const hash = md5(data);
                                    md5Hashes.push({ hash, file: entry.name });
                                } catch (error) {
                                    return rej(entry.name + " -- " + error);
                                }
                            }
                            zip.close();
                            res();
                        });
                    });
                    if (mod.downloads) {
                        mod.downloads.push({ type, url: path.join(filePath, fileName), hashMd5: md5Hashes });
                    }
                } catch (error) {
                    console.error("ModService.create zip.read", error);
                    throw new ServerError("mod.upload.zip.corrupt");
                }
                index++;
            }
            if (mod.downloads && !mod.downloads.length) {
                console.error("ModService.create download empty");
                await this.remove(toId(mod._id));
                throw new ServerError("mod.upload.zip.unknown");
            }
            await this.update(mod, true);
        }
        return true;
    }
}
