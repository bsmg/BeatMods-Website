import {user} from "./user";
import UserDAO from "modules/dao/UserDAO";

export interface IMod {
  _id?: Id;
  name: string;
  authorId: Id;
  author?: user;
  version: string;
  uploadDate: Date;
  description: string;
  dependencies: Id[];
  link: string;
  status: "pending" | "approved" | "declined";
  curator?: boolean;
  admin?: boolean;
  hashMd5?: string;
}
export type mod = IMod & {_id: Id};