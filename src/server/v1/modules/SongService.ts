import { ParameterError } from "../../types/error";
import { toId } from "../../modules/Utils";
import { ISong, ISongDifficulty, User } from "../models";
import SongDAO from "../../modules/dao/SongDAO";
import path from "path";
import AdmZip from "adm-zip";
import * as fs from "fs";
import md5File from "md5-file";
import sha1File from "sha1-file";
interface ISongUpload {
 songName: string;
 songSubName: string;
 authorName: string;
 beatsPerMinute: number;
 previewStartTime: number;
 previewDuration: number;
 coverImagePath: string;
 environmentName: string;
 difficultyLevels: ISongDifficulty[];   
}
export default class SongService {
  constructor(protected ctx: IContext) {
    this.dao = new SongDAO(this.ctx.db);
  }
  protected dao: SongDAO;

  public async insert(song: ISong) {
    if (song._id) {
      return null;
    }
    const _id = await this.dao.insert(song as any);
    return { _id, ...song } as ISong;
  }

  public async get(_id: string | Id) {
    return (await this.dao.get(toId(_id))[0]) as (ISong | null);
  }
private getRegex(param: string) {
  return {
    $regex: `${decodeURIComponent(param).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")}`,
    $options: "i"
  }
}
  public async list(params?: any) {
    let query: any = undefined;
    if (params && Object.keys(params).length) {
      if (params.search) {
        query = {
          $or: [{name: this.getRegex(params.search)},
          {"songDetail.songName": this.getRegex(params.search)},
          {"songDetail.songSubName": this.getRegex(params.search)},
          {"songDetail.authorName": this.getRegex(params.search)},
          {description: this.getRegex(params.search)}]
        };
      }
    }
    const cursor = await this.dao.list(query);
    const songs = await cursor.toArray();
    return songs.map(song => song as ISong);
  }

  public async update(song: ISong) {
    if (!song._id) {
      throw new ParameterError("song._id");
    }
    return (await this.dao.update(toId(song._id), song)) as ISong;
  }
  
  public async create(user: User, file: Express.Multer.File|null) {
    if (file){
      var zip = new AdmZip(file.buffer);
      var zipEntries = zip.getEntries();
      const entry = zipEntries.filter((entry) => entry.entryName.match(/info.json/i))[0];
      if (!entry) { return false; }
      const songUpload = JSON.parse(zip.readAsText(entry)) as ISongUpload;
      const imageEntry = zipEntries.filter((entry) => entry.entryName.indexOf(songUpload.coverImagePath) > -1)[0];

      const song: ISong = {
        name: songUpload.songName,
        description: "",
        userId: toId(user._id),
        user: user,
        songDetail: {
          songName: songUpload.songName,
          songSubName: songUpload.songSubName,
          authorName: songUpload.authorName,
          playCount: 0,
          downloadCount: 0,
          bpm: songUpload.beatsPerMinute,
          difficultyLevels: songUpload.difficultyLevels, 
          hashMd5: "",
          hashSha1: ""
        },
      };
      const {_id} = (await this.insert(song) as ISong & {_id: Id}); 
      song._id = toId(_id);  
      if (imageEntry) {
        zip.extractEntryTo(imageEntry, path.join(process.cwd(), "images"), false, true);
        const image = `${_id.toString()}.${imageEntry.entryName.split(".")[1]}`;
        const imagePath = path.join(process.cwd(), "images", image);
        fs.rename(path.join(process.cwd(), "images", songUpload.coverImagePath), imagePath, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
        song.songDetail.cover = `/images/${image}`;
      }
      const filename = path.join(process.cwd(), "uploads", `${_id.toString()}.zip`);
      zip.writeZip(filename);
      song.songDetail.hashMd5 = md5File.sync(filename)
      song.songDetail.hashSha1 = sha1File(filename);
      await this.update(song);
    }
    return true;
  }

}
