import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimitService {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });
  }

  async checkRateLimit(
    key: string,
    maxAttempts: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const currentCount = await this.redis.get(key);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    if (count >= maxAttempts) {
      return { allowed: false, remaining: 0 };
    }

    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSeconds);
    await pipeline.exec();

    return { allowed: true, remaining: maxAttempts - count - 1 };
  }
}
