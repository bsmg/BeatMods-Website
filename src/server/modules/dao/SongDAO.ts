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
    return await super.get(_id, options);
  }

  public async list(filter: dynamic = {}, options?: FindOneOptions) {
    return await super.list(filter, options);
  }

}
