export class CreateUserInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roleIds?: string[];
}
