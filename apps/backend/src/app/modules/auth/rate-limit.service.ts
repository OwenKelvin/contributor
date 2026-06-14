import { Injectable } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimitService {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    const redisOptions: RedisOptions = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      username: this.configService.get<string>('REDIS_USER') || undefined,
    };

    // Avoid passing an empty password/username to ioredis when Redis has no auth.
    if (!redisOptions.password) {
      delete redisOptions.password;
    }
    if (!redisOptions.username) {
      delete redisOptions.username;
    }

    this.redis = new Redis(redisOptions);
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
