import { User } from '../../user/user.model';

export class AuthResponse {
  user: User;
  accessToken: string;

}
