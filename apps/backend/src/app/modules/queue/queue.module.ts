import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailProcessor } from './mail.processor';
import { SequelizeModule } from '@nestjs/sequelize';
import { Activity } from '../activity';
import { EmailLogService } from './email-log.service';

@Global()
@Module({
  imports: [
    SequelizeModule.forFeature([Activity]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [MailProcessor, EmailLogService],
  exports: [BullModule],
})
export class QueueModule {}
