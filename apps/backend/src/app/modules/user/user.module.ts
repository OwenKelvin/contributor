import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UserService } from './user.service';
import { RoleModule } from '../role/role.module';
import { UserRole } from '../role/user-role.model'; // Import UserRole

@Module({
  imports: [SequelizeModule.forFeature([User, UserRole]), RoleModule], // Add UserRole
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
