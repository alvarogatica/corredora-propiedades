import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido.' })
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
