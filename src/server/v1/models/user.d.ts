export interface IUser {
    _id?: Id;
    username: string;
    email: string;
    lastLogin: Date | null;
}

export type user = IUser & { _id: Id };
