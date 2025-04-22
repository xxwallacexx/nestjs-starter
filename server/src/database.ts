import { Permission, UserStatus } from 'src/enum';

export type AuthUser = {
  id: string;
  isAdmin: boolean;
  name: string;
  email: string;
};

export type AuthApiKey = {
  id: string;
  permissions: Permission[];
};

export type ApiKey = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  permissions: Permission[];
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type UserAdmin = User & {
  shouldChangePassword: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  status: UserStatus;
};

export type AuthSession = {
  id: string;
};

const userColumns = ['id', 'name', 'email'] as const;

export const columns = {
  authUser: ['users.id', 'users.name', 'users.email', 'users.isAdmin'],
  authApiKey: ['api_keys.id', 'api_keys.permissions'],
  authSession: ['sessions.id', 'sessions.updatedAt'],
  user: userColumns,
  userAdmin: [...userColumns, 'createdAt', 'updatedAt', 'deletedAt', 'isAdmin', 'status', 'shouldChangePassword'],
  tagDto: ['id', 'value', 'createdAt', 'updatedAt', 'color', 'parentId'],
  apiKey: ['id', 'name', 'userId', 'createdAt', 'updatedAt', 'permissions'],
} as const;
