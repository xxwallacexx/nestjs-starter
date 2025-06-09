import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { parse } from 'cookie';
import { DateTime } from 'luxon';
import { IncomingHttpHeaders } from 'node:http';
import { AuthDto, SignUpDto } from 'src/dtos/auth.dto';
import { mapUserAdmin, UserAdminResponseDto } from 'src/dtos/user.dto';
import { AppCookie, AppHeader, AppQuery, Permission } from 'src/enum';
import { BaseService } from 'src/services/base.service';
import { setIsSuperset } from 'src/utils/set';

export type GrantedRequest = {
  requested: Permission[];
  current: Permission[];
};

export const isGranted = ({ requested, current }: GrantedRequest) => {
  if (current.includes(Permission.ALL)) {
    return true;
  }

  return setIsSuperset(new Set(current), new Set(requested));
};

export interface LoginDetails {
  isSecure: boolean;
  clientIp: string;
  deviceType: string;
  deviceOS: string;
}

export type ValidateRequest = {
  headers: IncomingHttpHeaders;
  queryParams: Record<string, string>;
  metadata: {
    adminRoute: boolean;
    permission?: Permission;
    uri: string;
  };
};

@Injectable()
export class AuthService extends BaseService {
  async adminSignUp(dto: SignUpDto): Promise<UserAdminResponseDto> {
    const adminUser = await this.userRepository.getAdmin();
    if (adminUser) {
      throw new BadRequestException('The server already has an admin');
    }

    const admin = await this.createUser({
      isAdmin: true,
      email: dto.email,
      name: dto.name,
      password: dto.password,
    });

    return mapUserAdmin(admin);
  }
  async authenticate({ headers, queryParams, metadata }: ValidateRequest): Promise<AuthDto> {
    const authDto = await this.validate({ headers, queryParams });
    const { adminRoute, permission, uri } = metadata;

    if (!authDto.user.isAdmin && adminRoute) {
      this.logger.warn(`Denied access to admin only route: ${uri}`);
      throw new ForbiddenException('Forbidden');
    }

    if (authDto.apiKey && permission && !isGranted({ requested: [permission], current: authDto.apiKey.permissions })) {
      throw new ForbiddenException(`Missing required permission: ${permission}`);
    }

    return authDto;
  }

  private getBearerToken(headers: IncomingHttpHeaders): string | null {
    const [type, token] = (headers.authorization || '').split(' ');
    if (type.toLowerCase() === 'bearer') {
      return token;
    }

    return null;
  }

  private async validateSession(tokenValue: string): Promise<AuthDto> {
    const hashedToken = this.cryptoRepository.hashSha256(tokenValue);
    const session = await this.sessionRepository.getByToken(hashedToken);
    if (session?.user) {
      const now = DateTime.now();
      const updatedAt = DateTime.fromJSDate(session.updatedAt);
      const diff = now.diff(updatedAt, ['hours']);
      if (diff.hours > 1) {
        await this.sessionRepository.update(session.id, { id: session.id, updatedAt: new Date() });
      }

      let hasElevatedPermission = false;

      if (session.pinExpiresAt) {
        const pinExpiresAt = DateTime.fromJSDate(session.pinExpiresAt);
        hasElevatedPermission = pinExpiresAt > now;

        if (hasElevatedPermission && now.plus({ minutes: 5 }) > pinExpiresAt) {
          await this.sessionRepository.update(session.id, {
            pinExpiresAt: DateTime.now().plus({ minutes: 5 }).toJSDate(),
          });
        }
      }

      return {
        user: session.user,
        session: {
          id: session.id,
          hasElevatedPermission,
        },
      };
    }

    throw new UnauthorizedException('Invalid user token');
  }

  private getCookieToken(headers: IncomingHttpHeaders): string | null {
    const cookies = parse(headers.cookie || '');
    return cookies[AppCookie.ACCESS_TOKEN] || null;
  }

  private async validate({ headers, queryParams }: Omit<ValidateRequest, 'metadata'>): Promise<AuthDto> {
    const session = (headers[AppHeader.USER_TOKEN] ||
      headers[AppHeader.SESSION_TOKEN] ||
      queryParams[AppQuery.SESSION_KEY] ||
      this.getBearerToken(headers) ||
      this.getCookieToken(headers)) as string;

    if (session) {
      return this.validateSession(session);
    }

    throw new UnauthorizedException('Authentication required');
  }
}
