import { Db, FindOneOptions } from 'mongodb';
import BaseDAO, { IBaseDAO } from './BaseDAO';

export interface IRedactedDbUser {
  _id: Id;
  username: string;
  email: string;
  lastLogin: Date | null;
  admin: boolean;
}

export interface IDbUser extends IRedactedDbUser {
  passwordHash: string;
}

export interface IUserDAO extends IBaseDAO<IRedactedDbUser> {
  getWithPassword(
    filter: dynamic,
    options?: FindOneOptions
  ): Promise<IDbUser | null>;
}

export default class UserDAO extends BaseDAO<IRedactedDbUser>
  implements IUserDAO {
  constructor(db: Db) {
    super('user', db);
  }

  public async getWithPassword(filter: dynamic, options?: FindOneOptions) {
    return await this.collection.findOne<IDbUser & { _id: Id }>(
      filter,
      options
    );
  }

  public async get(_id: Id | string, options?: FindOneOptions) {
    options = this.redactFields(options);
    return await super.get(_id, options);
  }

  public async list(filter: dynamic = {}, options?: FindOneOptions) {
    options = this.redactFields(options);
    return await super.list(filter, options);
  }

  protected redactFields(options?: FindOneOptions) {
    options = Object.assign({}, options);
    options.projection = Object.assign({}, options.projection, {
      passwordHash: false,
      salt: false
    });
    return options;
  }
}
