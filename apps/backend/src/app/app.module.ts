import { Module } from '@nestjs/common';
import { GraphqlModule } from './modules/graphql/graphql.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    GraphqlModule,
    DatabaseModule,
  ],
})
export class AppModule {}
