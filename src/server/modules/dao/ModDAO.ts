import { Db, FindOneOptions } from 'mongodb';
import BaseDAO, { IBaseDAO } from './BaseDAO';
import { IMod } from 'v1/models';
import { ServerError } from '../../types/error';
import UserDAO from './UserDAO';


export interface IModDAO extends IBaseDAO<IMod> {}

export default class ModDAO extends BaseDAO<IMod>
  implements IModDAO {
  constructor(db: Db) {
    super('mod', db);
  }

  public async getDependencies(dependencies: string) {
    const d = dependencies.split(",").filter(i => i.length);
    if (!d.length) { return []; }
    const _dependencies = d.map(dependency => ({version: dependency.trim().split("@")[1].trim(), name: dependency.trim().split("@")[0].trim()}));
    const foundDependencies =  await (await this.collection.find({$or: _dependencies}).toArray());
    if (foundDependencies.length !== _dependencies.length) {      
      throw new ServerError('server.invalid_dependencies', [], 400);
    }
    return foundDependencies;
  }

  public async get(_id: Id | string, options?: FindOneOptions) {
    return await (await this.collection.aggregate([{
      $match: {_id}},
      {$lookup: {
        from: "user",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }}
      ,{$unwind: "$user"}
    ], options)).toArray()[0];
  }

  public async list(filter: dynamic = {}, options?: FindOneOptions) {
    return await this.collection.aggregate([{
      $match: filter
    },
      {"$lookup":{
        "from":"user",
        "let":{"authorId": "$authorId"},
        pipeline: [{$match: {$expr: {$eq: ["$_id", "$$authorId"]}}}, {$project: {_id: 1, username: 1, lastLogin: 1}}],
        "as":"author"}},
      {"$unwind":"$author"},
      {$facet: {
          dependencies: [
          {$match: {"dependencies.0": {$exists: true}}}, 
          {$unwind: "$dependencies"},
          {$lookup: {
              "from": "mod",
              "localField": "dependencies",
              "foreignField": "_id",
              "as": "dependency"
              }
          },
          {$unwind: "$dependency"},
          {$group: {
              _id: "$_id",
              name: {$first: "$name"},
              version: {$first: "$version"},
              authorId: {$first: "$authorId"},
              uploadDate: {$first: "$uploadDate"},
              updatedDate: {$first: "$updatedDate"},
              author: {$first: "$author"},
              status: {$first: "$status"},
              description: {$first: "$description"},
              link: {$first: "$link"},
              dependencies: {$addToSet: "$dependency"},
              }}
          ],
          nonDependent: [{$match: {"dependencies.0": {$exists: false}}}]
          }},
           { "$project": {
          "data": { "$concatArrays": ["$dependencies", "$nonDependent"] }
        }},
        { "$unwind": "$data" },
        { "$replaceRoot": { "newRoot": "$data" } }
      ], options);
  }

}
