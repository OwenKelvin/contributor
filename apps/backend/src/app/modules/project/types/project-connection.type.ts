import { ObjectType, Field } from '@nestjs/graphql';
import { Project } from '../project.model';
import { PageInfo } from '../../../common/types/page-info.type';

@ObjectType()
export class ProjectConnection {
  @Field(() => [Project])
  projects: Project[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
