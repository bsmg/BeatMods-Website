import { ParameterError } from "../../types/error";
import { toId } from "../../modules/Utils";
import { User, ISong } from "../models";
import SongDAO from "../../modules/dao/SongDAO";

export default class SongService {
  constructor(protected ctx: IContext) {
    this.dao = new SongDAO(this.ctx.db);
  }
  protected dao: SongDAO;

  public async insert(user: User) {
    if (user._id) {
      return null;
    }
    const _id = await this.dao.insert(user as any);
    return { _id, ...user } as User;
  }

  public async get(_id: string | Id) {
    return (await this.dao.get(toId(_id))) as (User | null);
  }

  public async list() {
    const cursor = await this.dao.list();
    const songs = await cursor.toArray();
    return songs.map(song => song as ISong);
  }

  public async update(song: ISong) {
    if (!song._id) {
      throw new ParameterError("song._id");
    }
    return (await this.dao.update(toId(song._id), song)) as ISong;
  }
}
