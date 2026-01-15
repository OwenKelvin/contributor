import { InputType, Field, ID } from '@nestjs/graphql';
import { ProjectStatus } from '../project.model';

@InputType()
export class DateRangeInput {
  @Field()
  start: Date;

  @Field()
  end: Date;
}

@InputType()
export class ProjectFilter {
  @Field(() => ProjectStatus, { nullable: true })
  status?: ProjectStatus;

  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => DateRangeInput, { nullable: true })
  dateRange?: DateRangeInput;
}
