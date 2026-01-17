import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../user/user.model';

export class AuthResponse {
  user: User;
  accessToken: string;
}
