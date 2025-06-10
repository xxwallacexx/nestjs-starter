import { randomUUID } from 'node:crypto';
import { ApiKey, AuthApiKey, AuthUser, Session, User, UserAdmin } from 'src/database';
import { AuthDto } from 'src/dtos/auth.dto';
import { Permission, UserStatus } from 'src/enum';

export const newUuid = () => randomUUID() as string;
export const newUuids = () =>
  Array.from({ length: 100 })
    .fill(0)
    .map(() => newUuid());
export const newDate = () => new Date();
export const newUpdateId = () => 'uuid-v7';
export const newSha1 = () => Buffer.from('this is a fake hash');
export const newEmbedding = () => {
  const embedding = Array.from({ length: 512 })
    .fill(0)
    .map(() => Math.random());
  return '[' + embedding + ']';
};

const authFactory = ({
  apiKey,
  session,
  user,
}: {
  apiKey?: Partial<AuthApiKey>;
  session?: { id: string };
  user?: Omit<
    Partial<UserAdmin>,
    'createdAt' | 'updatedAt' | 'deletedAt' | 'fileCreatedAt' | 'fileModifiedAt' | 'localDateTime' | 'profileChangedAt'
  >;
} = {}) => {
  const auth: AuthDto = {
    user: authUserFactory(userAdminFactory(user ?? {})),
  };

  const userId = auth.user.id;

  if (apiKey) {
    auth.apiKey = authApiKeyFactory(apiKey);
  }

  if (session) {
    auth.session = { id: session.id, hasElevatedPermission: false };
  }

  return auth;
};

const authApiKeyFactory = (apiKey: Partial<AuthApiKey> = {}) => ({
  id: newUuid(),
  permissions: [Permission.ALL],
  ...apiKey,
});

const authUserFactory = (authUser: Partial<AuthUser> = {}) => {
  const { id = newUuid(), isAdmin = false, name = 'Test User', email = 'test@gmail.com' } = authUser;

  return { id, isAdmin, name, email };
};

const sessionFactory = (session: Partial<Session> = {}) => ({
  id: newUuid(),
  createdAt: newDate(),
  updatedAt: newDate(),
  updateId: newUpdateId(),
  deviceOS: 'android',
  deviceType: 'mobile',
  token: 'abc123',
  parentId: null,
  expiresAt: null,
  userId: newUuid(),
  pinExpiresAt: newDate(),
  ...session,
});

const userAdminFactory = (user: Partial<UserAdmin> = {}) => {
  const {
    id = newUuid(),
    name = 'Test User',
    email = 'test@gmail.com',
    shouldChangePassword = false,
    isAdmin = false,
    createdAt = newDate(),
    updatedAt = newDate(),
    deletedAt = null,
    status = UserStatus.ACTIVE,
  } = user;
  return {
    id,
    name,
    email,
    shouldChangePassword,
    isAdmin,
    createdAt,
    updatedAt,
    deletedAt,
    status,
  };
};

const apiKeyFactory = (apiKey: Partial<ApiKey> = {}) => ({
  id: newUuid(),
  userId: newUuid(),
  createdAt: newDate(),
  updatedAt: newDate(),
  updateId: newUpdateId(),
  name: 'Api Key',
  permissions: [Permission.ALL],
  ...apiKey,
});

const versionHistoryFactory = () => ({
  id: newUuid(),
  createdAt: newDate(),
  version: '1.0.0',
});

export const factory = {
  apiKey: apiKeyFactory,
  auth: authFactory,
  authApiKey: authApiKeyFactory,
  authUser: authUserFactory,
  session: sessionFactory,
  userAdmin: userAdminFactory,
  versionHistory: versionHistoryFactory,
  uuid: newUuid,
  date: newDate,
  responses: {
    badRequest: (message: any = null) => ({
      error: 'Bad Request',
      statusCode: 400,
      message: message ?? expect.anything(),
    }),
  },
};
