import {User} from "./user";

export interface ISong {
  _id?: Id;
  name: string;
  description: string;
  userId: Id;
  user?: User;
  songDetail: ISongDetail;
}
export interface ISongDetail {
  songName: string;
  songSubName: string;
  authorName: string;
  cover?: string;
  playCount: number;
  downloadCount: number;
  bpm: number;
  difficultyLevels: ISongDifficulty[];
  hashMd5: string;
  hashSha1: string;
}

export interface ISongDifficulty {
  difficulty: string;
  difficultyRank: number;
  audioPath: string;
  jsonPath: string;
  offset: number;
  oldOffset: number;
}