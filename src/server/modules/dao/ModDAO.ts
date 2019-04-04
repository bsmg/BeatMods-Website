import { Db, FindOneOptions } from "mongodb";
import BaseDAO, { IBaseDAO } from "./BaseDAO";
import { IDbMod } from "../../v1/models";
import { ServerError } from "../../../types/error";
import { toId } from "../../modules/Utils";

export interface IDbModDAO extends IBaseDAO<IDbMod> {}

export default class ModDAO extends BaseDAO<IDbMod> implements IDbModDAO {
    constructor(db: Db) {
        super("mod", db);
    }

    public async getDependencies(dependencies: string) {
        const d = dependencies.split(",").filter(i => i.length);
        if (!d.length) {
            return [];
        }
        const _dependencies = d.map(dependency => ({
            version: dependency
                .trim()
                .split("@")[1]
                .trim(),
            name: dependency
                .trim()
                .split("@")[0]
                .trim()
        }));
        const foundDependencies = await await this.collection.find({ $or: _dependencies }).toArray();
        if (foundDependencies.length !== _dependencies.length) {
            throw new ServerError("server.invalid_dependencies", [], 400);
        }
        return foundDependencies;
    }
    public async getOldVersions(existingMod: IDbMod) {
        if (!existingMod || !existingMod._id) {
            return [];
        }
        return await (await this.collection.aggregate([
            {
                $match: {
                    name: existingMod.name,
                    _id: { $ne: toId(existingMod._id) }
                }
            },
            { $project: { _id: 1, name: 1, version: { $split: ["$version", "."] } } },
            {
                $match: {
                    $or: [
                        {
                            "version.0": { $lt: existingMod.version.split(".")[0] }
                        },
                        { "version.0": { $eq: existingMod.version.split(".")[0] }, "version.1": { $lt: existingMod.version.split(".")[1] } },
                        {
                            "version.0": { $eq: existingMod.version.split(".")[0] },
                            "version.1": { $eq: existingMod.version.split(".")[1] },
                            "version.2": { $lt: existingMod.version.split(".")[2] }
                        },
                        {
                            "version.0": { $eq: existingMod.version.split(".")[0] },
                            "version.1": { $eq: existingMod.version.split(".")[1] },
                            "version.2": { $eq: existingMod.version.split(".")[2] }
                        },
                        {
                            "version.0": { $gt: existingMod.version.split(".")[0] }
                        },
                        { "version.0": { $eq: existingMod.version.split(".")[0] }, "version.1": { $gt: existingMod.version.split(".")[1] } },
                        {
                            "version.0": { $eq: existingMod.version.split(".")[0] },
                            "version.1": { $eq: existingMod.version.split(".")[1] },
                            "version.2": { $gt: existingMod.version.split(".")[2] }
                        }
                    ]
                }
            },
            { $project: { _id: 1 } }
        ])).toArray();
    }

    public async get(_id: Id | string, options?: FindOneOptions) {
        return (await (await this.collection.aggregate(
            [
                {
                    $match: { _id: toId(_id) }
                },
                {
                    $lookup: {
                        from: "user",
                        localField: "authorId",
                        foreignField: "_id",
                        as: "author"
                    }
                },
                { $unwind: "$author" }
            ],
            options
        )).toArray())[0];
    }

    public async list(filter: dynamic = {}, options?: FindOneOptions) {
        return await this.collection.aggregate(
            [
                {
                    $match: filter
                },
                {
                    $lookup: {
                        from: "user",
                        let: { authorId: "$authorId" },
                        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$authorId"] } } }, { $project: { _id: 1, username: 1, lastLogin: 1 } }],
                        as: "author"
                    }
                },
                { $unwind: "$author" },
                {
                    $facet: {
                        dependencies: [
                            { $match: { "dependencies.0": { $exists: true } } },
                            { $unwind: "$dependencies" },
                            {
                                $lookup: {
                                    from: "mod",
                                    localField: "dependencies",
                                    foreignField: "_id",
                                    as: "dependency"
                                }
                            },
                            { $unwind: "$dependency" },
                            {
                                $group: {
                                    _id: "$_id",
                                    name: { $first: "$name" },
                                    version: { $first: "$version" },
                                    authorId: { $first: "$authorId" },
                                    uploadDate: { $first: "$uploadDate" },
                                    updatedDate: { $first: "$updatedDate" },
                                    author: { $first: "$author" },
                                    status: { $first: "$status" },
                                    description: { $first: "$description" },
                                    link: { $first: "$link" },
                                    downloads: { $first: "$downloads" },
                                    dependencies: { $addToSet: "$dependency" }
                                }
                            }
                        ],
                        nonDependent: [{ $match: { "dependencies.0": { $exists: false } } }]
                    }
                },
                {
                    $project: {
                        data: { $concatArrays: ["$dependencies", "$nonDependent"] }
                    }
                },
                { $unwind: "$data" },
                { $replaceRoot: { newRoot: "$data" } },
                { $sort: { name: 1, version: -1, updatedDate: -1 } }
            ],
            options
        );
    }
}
