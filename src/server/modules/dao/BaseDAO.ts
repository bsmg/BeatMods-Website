import {
  Db,
  Collection,
  Cursor,
  FindOneOptions,
  ReplaceOneOptions,
  CollectionInsertOneOptions,
  FindOneAndReplaceOption
} from 'mongodb';
import { toId } from '../Utils';

export interface IBaseDAO<T extends { _id?: Id }> {
  insert(item: T, options?: CollectionInsertOneOptions): Promise<Id>;
  get(
    _id: Id | string,
    options?: FindOneOptions
  ): Promise<T & { _id: Id } | null>;
  list(
    filter: dynamic,
    options?: FindOneOptions
  ): Promise<Cursor<T & { _id: Id }>>;
  update(
    _id: Id | string,
    item: dynamic,
    options?: ReplaceOneOptions
  ): Promise<T & { _id: Id } | null>;
  updateMatch(
    filter: dynamic,
    item: dynamic,
    options?: ReplaceOneOptions
  ): Promise<number>;
  replace(
    id: Id | string,
    item: T,
    options?: FindOneAndReplaceOption
  ): Promise<T & { _id: Id } | null>;
  write(
    filter: dynamic,
    commands: dynamic,
    options?: ReplaceOneOptions
  ): Promise<number>;
}

export default class BaseDAO<T extends { _id?: Id }> implements IBaseDAO<T> {
  constructor(collectionName: string, db: Db) {
    this.collection = db.collection<T & { _id: Id }>(collectionName);
  }
  protected collection: Collection<T & { _id: Id }>;

  public async insert(item: T, options?: CollectionInsertOneOptions) {
    const results = await this.collection.insertOne(
      item as (T & { _id: Id }),
      options
    );
    return results.insertedId;
  }

  public async get(_id: Id | string, options?: FindOneOptions) {
    return await this.collection.findOne({ _id: toId(_id) }, options);
  }

  public async find(filter: dynamic, options?: FindOneOptions) {
    return await this.collection.findOne(filter, options);
  }

  public async list(filter: dynamic, options?: FindOneOptions) {
    return await this.collection.find(filter, options);
  }

  public async update(
    _id: Id | string,
    item: dynamic,
    options?: ReplaceOneOptions
  ) {
    const _options = Object.assign({ returnNewDocument: true }, options);
    const result = await this.collection.findOneAndUpdate(
      { _id: toId(_id) },
      { $set: item },
      _options
    );
    return result.value || null;
  }

  public async updateMatch(
    filter: dynamic,
    item: dynamic,
    options?: ReplaceOneOptions
  ) {
    const results = await this.collection.update(
      filter,
      { $set: item },
      options
    );
    return results.result.nModified as number;
  }

  public async replace(
    _id: Id | string,
    item: T,
    options?: FindOneAndReplaceOption
  ) {
    const _options = Object.assign({ returnNewDocument: true }, options);
    const result = await this.collection.findOneAndUpdate(
      { _id: toId(_id) },
      item as (T & { _id: Id }),
      _options
    );
    return result.value || null;
  }

  public async write(
    filter: dynamic,
    commands: dynamic,
    options?: ReplaceOneOptions
  ) {
    const results = await this.collection.update(filter, commands, options);
    return results.result.nModified as number;
  }
}
