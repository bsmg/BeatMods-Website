import { Db, FindOneOptions } from 'mongodb';
import BaseDAO, { IBaseDAO } from './BaseDAO';
import { ISong } from 'v1/models';


export interface ISongDAO extends IBaseDAO<ISong> {}

export default class SongDAO extends BaseDAO<ISong>
  implements ISongDAO {
  constructor(db: Db) {
    super('song', db);
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
    ], options)).toArray();
  }

  public async list(filter: dynamic = {}, options?: FindOneOptions) {
    return await this.collection.aggregate([{
      $match: filter
    },
      {$lookup: {
        from: "user",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }}
      ,{$unwind: "$user"}
    ], options);
  }

}
