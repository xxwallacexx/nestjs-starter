import { UserStatus } from 'src/enum';

export class UserEntity {
  id!: string;
  name!: string;
  isAdmin!: boolean;
  email!: string;
  password!: string;
  shouldChangePassword!: boolean;
  createdAt!: Date;
  deletedAt!: Date;
  status!: UserStatus;
  updatedAt!: Date;
  updateId!: string;
}
