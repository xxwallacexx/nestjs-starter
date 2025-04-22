import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserAdminCreateDto, UserAdminResponseDto } from 'src/dtos/user.dto';
import { Permission } from 'src/enum';
import { Authenticated } from 'src/middlewares/auth.guard';
import { UserAdminService } from 'src/services/user-admin.service';
import { UUIDParamDto } from 'src/validation';

@ApiTags('Users (admin)')
@Controller('admin/users')
export class UserAdminController {
  constructor(private service: UserAdminService) {}

  @Post()
  @Authenticated({ permission: Permission.ADMIN_USER_CREATE, admin: true })
  createUserAdmin(@Body() createUserDto: UserAdminCreateDto): Promise<UserAdminResponseDto> {
    return this.service.create(createUserDto);
  }

  @Get(':id')
  @Authenticated({ permission: Permission.ADMIN_USER_READ, admin: true })
  getUserAdmin(@Param() { id }: UUIDParamDto): Promise<UserAdminResponseDto> {
    return this.service.get(id);
  }
}
