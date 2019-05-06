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
                    gameVersion: { $ne: existingMod.gameVersion },
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

    public async list(filter: dynamic = {}, options?: FindOneOptions & { sort?: { [sort: string]: number } }) {
        return await this.collection.aggregate(
            [
                {
                    $match: filter
                },
                {
                    $lookup: {
                        from: "user",
                        let: { authorId: "$authorId" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$authorId"] } } },
                            { $project: { _id: 1, username: 1, username_lower: { $toLower: "$username" }, lastLogin: 1 } }
                        ],
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
                                    gameVersion: { $first: "$gameVersion" },
                                    authorId: { $first: "$authorId" },
                                    uploadDate: { $first: "$uploadDate" },
                                    updatedDate: { $first: "$updatedDate" },
                                    author: { $first: "$author" },
                                    status: { $first: "$status" },
                                    description: { $first: "$description" },
                                    link: { $first: "$link" },
                                    category: { $first: "$category" },
                                    downloads: { $first: "$downloads" },
                                    required: { $first: "$required" },
                                    dependencies: { $addToSet: "$dependency" }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    name_lower: { $toLower: "$name" },
                                    version: 1,
                                    gameVersion: 1,
                                    authorId: 1,
                                    uploadDate: 1,
                                    updatedDate: 1,
                                    author: 1,
                                    status: { $toLower: "$status" },
                                    description: 1,
                                    link: 1,
                                    category: 1,
                                    category_lower: { $toLower: "$category" },
                                    downloads: 1,
                                    required: 1,
                                    dependencies: 1
                                }
                            }
                        ],
                        nonDependent: [
                            { $match: { "dependencies.0": { $exists: false } } },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    name_lower: { $toLower: "$name" },
                                    version: 1,
                                    gameVersion: 1,
                                    authorId: 1,
                                    uploadDate: 1,
                                    updatedDate: 1,
                                    author: 1,
                                    status: { $toLower: "$status" },
                                    description: 1,
                                    link: 1,
                                    category: 1,
                                    category_lower: { $toLower: "$category" },
                                    downloads: 1,
                                    required: 1,
                                    dependencies: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        data: { $concatArrays: ["$dependencies", "$nonDependent"] }
                    }
                },
                { $unwind: "$data" },
                { $replaceRoot: { newRoot: "$data" } },
                {
                    $group: {
                        _id: { name: "$name", version: "$version", status: "status" },
                        id: { $first: "$_id" },
                        name: { $first: "$name" },
                        name_lower: { $first: "$name_lower" },
                        version: { $first: "$version" },
                        gameVersion: { $first: "$gameVersion" },
                        authorId: { $first: "$authorId" },
                        uploadDate: { $first: "$uploadDate" },
                        updatedDate: { $first: "$updatedDate" },
                        author: { $first: "$author" },
                        status: { $first: "$status" },
                        description: { $first: "$description" },
                        link: { $first: "$link" },
                        category: { $first: "$category" },
                        category_lower: { $first: "$category_lower" },
                        downloads: { $first: "$downloads" },
                        required: { $first: "$required" },
                        dependencies: { $first: "$dependencies" }
                    }
                },
                { $sort: { ...(options && options.sort ? options.sort : {}), required: -1, category_lower: 1, updatedDate: -1 } },
                {
                    $project: {
                        _id: "$id",
                        name: 1,
                        version: 1,
                        gameVersion: 1,
                        authorId: 1,
                        uploadDate: 1,
                        updatedDate: 1,
                        author: {
                            _id: "$author._id",
                            username: "$author.username",
                            lastLogin: "$author.lastLogin"
                        },
                        status: 1,
                        description: 1,
                        link: 1,
                        category: 1,
                        downloads: 1,
                        required: 1,
                        dependencies: 1
                    }
                }
            ],
            options
        );
    }
}
