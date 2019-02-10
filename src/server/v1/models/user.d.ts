export interface User {
  _id?: Id;
  name: string;
  email: string;
  lastLogin: Date | null;
}
