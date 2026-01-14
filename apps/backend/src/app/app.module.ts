import { Module } from '@nestjs/common';
import { GraphqlModule } from './modules/graphql/graphql.module';

@Module({
  imports: [
    GraphqlModule
  ],
})
export class AppModule {}
