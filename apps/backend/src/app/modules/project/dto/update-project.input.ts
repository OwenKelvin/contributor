import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { ProjectStatus } from '../project.model';

@InputType()
export class UpdateProjectInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  detailedDescription?: string;

  @Field(() => Float, { nullable: true })
  goalAmount?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  featuredImage?: string;

  @Field(() => ProjectStatus, { nullable: true })
  status?: ProjectStatus;
}
