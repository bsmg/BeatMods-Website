import { ObjectId } from "mongodb";

declare global {
    interface dynamic<T = any> {
        [key: string]: T;
    }
    type Id = ObjectId;
}

export interface global {}
