export interface ISong {
  _id?: Id;
  name: string;
  description: string;
  userId: Id;
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
  difficultyLevels: object;
  hashMd5: string;
  hashSha1: string;
}
