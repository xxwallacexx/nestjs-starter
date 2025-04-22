import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SignUpDto } from 'src/dtos/auth.dto';
import { UserAdminResponseDto } from 'src/dtos/user.dto';
import { AuthService } from 'src/services/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('adminSignup')
  signUpAdmin(@Body() dto: SignUpDto): Promise<UserAdminResponseDto> {
    return this.service.adminSignUp(dto);
  }
}
