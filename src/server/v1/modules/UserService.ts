import * as bcrypt from 'bcrypt';

import UserDAO from '../../modules/dao/UserDAO';
import { ServerError, ParameterError } from '../../types/error';
import { toId } from '../../modules/Utils';
import { User } from '../models';

export default class UserService {
  constructor(protected ctx: IContext) {
    this.dao = new UserDAO(this.ctx.db);
  }
  protected dao: UserDAO;

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
    const users = await cursor.toArray();
    return users.map(user => user as User);
  }

  public async update(user: User) {
    if (!user._id) {
      throw new ParameterError('user._id');
    }
    delete user['passwordHash'];
    return (await this.dao.update(toId(user._id), user)) as User;
  }

  public async changePassword(
    _id: Id | string,
    current: string,
    password: string
  ) {
    const user = await this.dao.getWithPassword({ _id: toId(_id) });
    if (!user || !bcrypt.compareSync(current, user.passwordHash)) {
      throw new ServerError('server.invalid_password', [], 400);
    }
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    this.dao.update(_id, { passwordHash });
  }

  public async create(username: string, email: string, password: string) {
    const _user = await this.dao.find({ email });
    if (_user) {
      throw new ServerError('server.duplicate_email', [], 400);
    }
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const user = {
      username,
      email,
      lastLogin: null,
      passwordHash
    };
    const _id = await this.dao.insert(user);
    return { _id, ...user } as User;
  }
}
