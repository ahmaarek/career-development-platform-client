export class User {
  constructor(
    public email: string,
    public id: string,
    public name: string,
    public photoUrl: string | null,
    public role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN',
    public managerId: string | null,
    public imageId: string | null,
  ) {}
}

export interface FullUser extends User {
  points: number;
  imageUrl?: string;
}