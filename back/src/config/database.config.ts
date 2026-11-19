import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities';
import { Property, PropertyImage } from '../modules/properties/entities';
import { Appointment } from '../modules/appointments/entities';
import { AuditLog } from '../modules/audit/entities';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'admin_corredora'),
  password: configService.get<string>('DB_PASSWORD', 'admin123'),
  database: configService.get<string>('DB_NAME', 'corredora_db'),
  entities: [User, Property, PropertyImage, Appointment, AuditLog],
  synchronize: configService.get<string>('NODE_ENV') === 'development',
  logging: false,
});
