import { InputType, Field, ID } from '@nestjs/graphql';
import { ProjectStatus } from '../project.model';

@InputType()
export class BulkUpdateInput {
  @Field(() => ProjectStatus, { nullable: true })
  status?: ProjectStatus;

  @Field(() => ID, { nullable: true })
  categoryId?: string;
}
