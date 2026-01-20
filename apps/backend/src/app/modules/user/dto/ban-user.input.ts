import { Field, InputType } from '@nestjs/graphql';
import { IsUUID, IsOptional, IsString } from 'class-validator';

@InputType()
export class BanUserInput {
  @Field()
  @IsUUID()
  userId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}
