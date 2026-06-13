import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ContactMessageInput {
  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  subject!: string;

  @Field()
  message!: string;
}
