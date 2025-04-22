import { BadRequestException, Injectable } from '@nestjs/common';
import { SALT_ROUNDS } from 'src/constants';
import { mapUserAdmin, UserAdminCreateDto, UserAdminResponseDto, UserAdminUpdateDto } from 'src/dtos/user.dto';
import { UserFindOptions } from 'src/repositories/user.repository';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class UserAdminService extends BaseService {
  async create(dto: UserAdminCreateDto): Promise<UserAdminResponseDto> {
    const { notify, ...userDto } = dto;
    const user = await this.createUser(userDto);
    await this.eventRepository.emit('user.signup', {
      notify: !!notify,
      id: user.id,
      tempPassword: user.shouldChangePassword ? userDto.password : undefined,
    });

    return mapUserAdmin(user);
  }

  async get(id: string): Promise<UserAdminResponseDto> {
    const user = await this.findOrFail(id, { withDeleted: false });
    return mapUserAdmin(user);
  }

  async update(id: string, dto: UserAdminUpdateDto): Promise<UserAdminResponseDto> {
    if (dto.email) {
      const duplicate = await this.userRepository.getByEmail(dto.email);
      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException('Email already in use by another account');
      }
    }

    if (dto.password) {
      dto.password = await this.cryptoRepository.hashBcrypt(dto.password, SALT_ROUNDS);
    }

    const updatedUser = await this.userRepository.update(id, { ...dto, updatedAt: new Date() });
    return mapUserAdmin(updatedUser);
  }

  private async findOrFail(id: string, options: UserFindOptions) {
    const user = await this.userRepository.get(id, options);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }
}
