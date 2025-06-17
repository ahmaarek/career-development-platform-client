export class User {
  constructor(
    public email: string,
    public id: string,
    public name: string,
    public role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN',
    public managerId: string | null,
    public photoUrl: string | null,
  ) {}
}

export interface UserWithScore extends User {
  points: number;
}