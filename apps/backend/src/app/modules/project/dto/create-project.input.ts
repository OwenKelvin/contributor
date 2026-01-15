import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { ProjectStatus } from '../project.model';

@InputType()
export class CreateProjectInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  detailedDescription: string;

  @Field(() => Float)
  goalAmount: number;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field(() => ID)
  categoryId: string;

  @Field({ nullable: true })
  featuredImage?: string;

  @Field(() => ProjectStatus)
  status: ProjectStatus;
}
