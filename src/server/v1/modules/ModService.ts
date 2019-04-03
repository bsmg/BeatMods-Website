import { ParameterError } from "../../types/error";
import { toId } from "../../modules/Utils";
import { IMod } from "../models";
import path from "path";
import AdmZip from "adm-zip";
import md5File from "md5-file";
import ModDAO from '../../modules/dao/ModDAO';

export default class ModService {
  constructor(protected ctx: IContext) {
    this.dao = new ModDAO(this.ctx.db);
  }
  protected dao: ModDAO;

  public async insert(mod: IMod) {
    if (mod._id) {
      return null;
    }
    const _id = await this.dao.insert(mod as any);
    return { _id, ...mod } as IMod;
  }

  public async get(_id: string | Id) {
    return (await this.dao.get(toId(_id))[0]) as (IMod | null);
  }

  private getRegex(param: string) {
    return {
      $regex: `${decodeURIComponent(param).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")}`,
      $options: "i"
    }
  }
  public async list(params?: any) {
    let query: any = {};
    if (params && Object.keys(params).length) {
      if (params.search && params.search.length) {
        query.$or= [{name: this.getRegex(params.search)},
          {description: this.getRegex(params.search)},
          {author: this.getRegex(params.search)},
          ]
        ;
      }
      if (params.status && params.status.length) {
        query.status = params.status;
      }
    }
    const cursor = await this.dao.list(Object.keys(query).length ? query : undefined);
    const mods = await cursor.toArray();
    return mods.map(mod => mod as IMod);
  }

  public async update(mod: IMod) {
    if (!mod._id) {
      throw new ParameterError("mod._id");
    }
    return (await this.dao.update(toId(mod._id), mod)) as IMod;
  }
  
  public async create(user: ISessionUser, name: string, description: string, version: string, dependencies: string, link: string, file: Express.Multer.File|null) {
    if (file){
      var zip = new AdmZip(file.buffer);
      const mod: IMod = {
        name,
        description: description|| "",
        authorId: toId(user._id),
        version,
        link,
        uploadDate: new Date(),
        status: "pending",
        dependencies: (await this.dao.getDependencies(dependencies)).map(m => m._id)
      };
      const {_id} = (await this.insert(mod) as IMod & {_id: Id}); 
      mod._id = toId(_id);  
      const filename = path.join(process.cwd(), "uploads", _id.toString(), `${name}-${version}.zip`);
      zip.writeZip(filename);
      mod.hashMd5 = md5File.sync(filename)
      await this.update(mod);
    }
    return true;
  }

}
