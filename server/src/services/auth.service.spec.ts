import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { UserAdmin } from 'src/database';
import { SignUpDto } from 'src/dtos/auth.dto';
import { AuthService } from 'src/services/auth.service';
import { factory } from 'test/small.factory';
import { newTestService, ServiceMocks } from 'test/utils';

describe(AuthService.name, () => {
  let sut: AuthService;
  let mocks: ServiceMocks;

  beforeEach(() => {
    ({ sut, mocks } = newTestService(AuthService));
  });

  it('should be defined', () => {
    expect(sut).toBeDefined();
  });

  describe('adminSignUp', () => {
    const dto: SignUpDto = { email: 'test@gmail.com', password: 'password', name: 'admin' };

    it('should only allow one admin', async () => {
      mocks.user.getAdmin.mockResolvedValue({} as UserAdmin);

      await expect(sut.adminSignUp(dto)).rejects.toBeInstanceOf(BadRequestException);

      expect(mocks.user.getAdmin).toHaveBeenCalled();
    });

    it('should sign up the admin', async () => {
      mocks.user.getAdmin.mockResolvedValue(void 0);
      mocks.user.create.mockResolvedValue({
        ...dto,
        id: 'admin',
        createdAt: new Date('2021-01-01'),
      } as unknown as UserAdmin);

      await expect(sut.adminSignUp(dto)).resolves.toMatchObject({
        id: 'admin',
        createdAt: new Date('2021-01-01'),
        email: 'test@gmail.com',
        name: 'admin',
      });

      expect(mocks.user.getAdmin).toHaveBeenCalled();
      expect(mocks.user.create).toHaveBeenCalled();
    });
  });

  describe('validate - socket connections', () => {
    it('should throw when token is not provided', async () => {
      await expect(
        sut.authenticate({
          headers: {},
          queryParams: {},
          metadata: { adminRoute: false, uri: 'test' },
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should validate using authorization header', async () => {
      const session = factory.session();
      const sessionWithToken = {
        id: session.id,
        updatedAt: session.updatedAt,
        user: factory.authUser(),
        pinExpiresAt: null,
      };

      mocks.session.getByToken.mockResolvedValue(sessionWithToken);

      await expect(
        sut.authenticate({
          headers: { authorization: 'Bearer auth_token' },
          queryParams: {},
          metadata: { adminRoute: false, uri: 'test' },
        }),
      ).resolves.toEqual({
        user: sessionWithToken.user,
        session: { id: session.id, hasElevatedPermission: false },
      });
    });
  });

  describe('validate - user token', () => {
    it('should throw if no token is found', async () => {
      mocks.session.getByToken.mockResolvedValue(void 0);

      await expect(
        sut.authenticate({
          headers: { 'x-user-token': 'auth_token' },
          queryParams: {},
          metadata: { adminRoute: false, uri: 'test' },
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should return an auth dto', async () => {
      const session = factory.session();
      const sessionWithToken = {
        id: session.id,
        updatedAt: session.updatedAt,
        user: factory.authUser(),
        pinExpiresAt: null,
      };

      mocks.session.getByToken.mockResolvedValue(sessionWithToken);

      await expect(
        sut.authenticate({
          headers: { cookie: 'access_token=auth_token' },
          queryParams: {},
          metadata: { adminRoute: false, uri: 'test' },
        }),
      ).resolves.toEqual({
        user: sessionWithToken.user,
        session: { id: session.id, hasElevatedPermission: false },
      });
    });

    it('should throw if admin route and not an admin', async () => {
      const session = factory.session();
      const sessionWithToken = {
        id: session.id,
        updatedAt: session.updatedAt,
        user: factory.authUser(),
        pinExpiresAt: null,
      };

      mocks.session.getByToken.mockResolvedValue(sessionWithToken);

      await expect(
        sut.authenticate({
          headers: { cookie: 'access_token=auth_token' },
          queryParams: {},
          metadata: { adminRoute: true, uri: 'test' },
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should update when access time exceeds an hour', async () => {
      const session = factory.session({ updatedAt: DateTime.now().minus({ hours: 2 }).toJSDate() });
      const sessionWithToken = {
        id: session.id,
        updatedAt: session.updatedAt,
        user: factory.authUser(),
        pinExpiresAt: null,
      };

      mocks.session.getByToken.mockResolvedValue(sessionWithToken);
      mocks.session.update.mockResolvedValue(session);

      await expect(
        sut.authenticate({
          headers: { cookie: 'access_token=auth_token' },
          queryParams: {},
          metadata: { adminRoute: false, uri: 'test' },
        }),
      ).resolves.toBeDefined();

      expect(mocks.session.update).toHaveBeenCalled();
    });
  });
});
