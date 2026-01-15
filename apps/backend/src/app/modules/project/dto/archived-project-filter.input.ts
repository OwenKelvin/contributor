import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ArchivedProjectFilter {
  @Field({ nullable: true })
  archivedAfter?: Date;

  @Field({ nullable: true })
  archivedBefore?: Date;
}
