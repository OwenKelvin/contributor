import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class HealthCheck {
  @Field()
  name: string;

  @Field()
  status: 'OK' | 'Error' | 'Degraded';

  @Field({ nullable: true })
  details?: string;

  @Field(() => Float)
  responseTime: number;
}
