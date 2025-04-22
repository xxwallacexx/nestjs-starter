import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AuthApiKey, AuthSession, AuthUser } from 'src/database';
import { AppCookie } from 'src/enum';
import { toEmail } from 'src/validation';

export type CookieResponse = {
  isSecure: boolean;
  values: Array<{ key: AppCookie; value: string }>;
};

export class AuthDto {
  user!: AuthUser;
  apiKey?: AuthApiKey;
  session?: AuthSession;
}

export class LoginCredentialDto {
  @IsEmail({ require_tld: false })
  @Transform(toEmail)
  @IsNotEmpty()
  @ApiProperty({ example: 'testuser@email.com' })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'password' })
  password!: string;
}

export class LoginResponseDto {
  accessToken!: string;
  userId!: string;
  userEmail!: string;
  name!: string;
  isAdmin!: boolean;
  shouldChangePassword!: boolean;
}

export class LogoutResponseDto {
  successful!: boolean;
  redirectUri!: string;
}

export class SignUpDto extends LoginCredentialDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Admin' })
  name!: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'password' })
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({ example: 'password' })
  newPassword!: string;
}

export class ValidateAccessTokenResponseDto {
  authStatus!: boolean;
}
