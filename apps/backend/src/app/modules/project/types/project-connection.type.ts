import { ObjectType, Field } from '@nestjs/graphql';
import { Project } from '../project.model';

@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field({ nullable: true })
  cursor?: string | null;
}

@ObjectType()
export class ProjectConnection {
  @Field(() => [Project])
  projects: Project[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
