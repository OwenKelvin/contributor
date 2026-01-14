import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../user/user.model';
import { Role } from '../role/role.model';
import { Permission } from '../permission/permission.model';
import { UserRole } from '../role/user-role.model';
import { RolePermission } from '../permission/role-permission.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadModels: true,
        synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', false),
        models: [User, Role, Permission, UserRole, RolePermission],
      }),
    }),
  ],
})
export class DatabaseModule {}
