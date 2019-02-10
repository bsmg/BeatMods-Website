import { ObjectId } from 'mongodb';

declare global {
	type dynamic<T = any> = { [key: string]: T }
	type Id = ObjectId;
}

export interface global {}
