import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { RoleModule } from '../role/role.module';
import { UserRole } from '../role/user-role.model';
import { Role } from '../role/role.model';

@Module({
  imports: [SequelizeModule.forFeature([User, UserRole, Role]), RoleModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
