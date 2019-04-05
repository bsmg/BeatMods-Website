import * as bcrypt from "bcrypt";

import userDAO from "../../modules/dao/UserDAO";
import { ServerError, ParameterError } from "../../../types/error";
import { toId } from "../../modules/Utils";
import { user } from "../models";

export default class UserService {
    constructor(protected ctx: IContext) {
        this.dao = new userDAO(this.ctx.db);
    }
    protected dao: userDAO;

    public async insert(_user: user) {
        if (_user._id) {
            return null;
        }
        const _id = await this.dao.insert(_user as any);
        return { _id, ..._user } as user;
    }

    public async get(_id: string | Id) {
        return (await this.dao.get(toId(_id))) as (user | null);
    }

    public async list() {
        const cursor = await this.dao.list();
        const users = await cursor.toArray();
        return users.map(_user => _user as user);
    }

    public async update(_user: user) {
        if (!_user._id) {
            throw new ParameterError("user._id");
        }
        delete _user["passwordHash"];
        return (await this.dao.update(toId(_user._id), _user)) as user;
    }

    public async changePassword(_id: Id | string, current: string, password: string) {
        const _user = await this.dao.getWithPassword({ _id: toId(_id) });
        if (!_user || !bcrypt.compareSync(current, _user.passwordHash)) {
            throw new ServerError("server.invalid_password", [], 400);
        }
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        this.dao.update(_id, { passwordHash });
    }

    public async create(username: string, email: string, password: string) {
        if (!new RegExp(/^[\w\- ]+$/).test(username.trim())) {
            throw new ServerError("server.invalid_username", [], 400);
        }
        const _user = await this.dao.find({ $or: [{ email }, { username }] });
        if (_user) {
            throw new ServerError("server.duplicate_account", [], 400);
        }
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        const __user = {
            username: username.trim(),
            email: email.trim(),
            lastLogin: null,
            passwordHash
        };
        const _id = await this.dao.insert(__user);
        return { _id, ...__user } as user;
    }
}
