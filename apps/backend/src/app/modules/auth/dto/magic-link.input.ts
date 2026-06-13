import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class MagicLinkLoginInput {
  @Field()
  token: string;

  @Field({ nullable: true })
  acceptTerms?: boolean;
}
