export interface User {
  _id?: Id;
  username: string;
  email: string;
  lastLogin: Date | null;
}
