import { Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { HealthCheck } from './types/health.type';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private sequelize: Sequelize) {}

  async checkHealth(): Promise<HealthCheck[]> {
    const checks: Promise<HealthCheck>[] = [
      this.checkDatabase(),
      // Future checks like Redis can be added here
    ];
    return Promise.all(checks);
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      await this.sequelize.authenticate();
      const responseTime = Date.now() - startTime;
      this.logger.log(`Database health check successful in ${responseTime}ms`);
      return {
        name: 'Database',
        status: 'OK',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error(`Database health check failed: ${error.message}`, error.stack);
      return {
        name: 'Database',
        status: 'Error',
        details: error.message,
        responseTime,
      };
    }
  }
}
