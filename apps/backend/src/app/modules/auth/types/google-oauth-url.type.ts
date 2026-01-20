import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GoogleOAuthUrl {
  @Field()
  url: string;
}