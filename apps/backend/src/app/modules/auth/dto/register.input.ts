import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @Field()
  @IsNotEmpty()
  firstName: string;

  @Field()
  @IsNotEmpty()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;
}
