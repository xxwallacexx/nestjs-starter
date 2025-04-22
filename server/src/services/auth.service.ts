import { BadRequestException, Injectable } from '@nestjs/common';
import { IncomingHttpHeaders } from 'node:http';
import { SignUpDto } from 'src/dtos/auth.dto';
import { mapUserAdmin, UserAdminResponseDto } from 'src/dtos/user.dto';
import { Permission } from 'src/enum';
import { BaseService } from 'src/services/base.service';

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
}
