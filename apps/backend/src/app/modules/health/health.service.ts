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
      this.checkBackendApi(),
      this.checkCacheService(),
      this.checkBackgroundJobs(),
      this.checkEmailService(),
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

  private async checkBackendApi(): Promise<HealthCheck> {
    const startTime = Date.now();
    // Simulate an API call
    const isHealthy = Math.random() > 0.2; // 80% chance of being healthy
    const responseTime = Date.now() - startTime + Math.random() * 100; // Simulate response time

    if (isHealthy) {
      return {
        name: 'Backend API',
        status: 'OK',
        responseTime,
      };
    } else {
      return {
        name: 'Backend API',
        status: 'Error',
        details: 'Simulated API error',
        responseTime,
      };
    }
  }

  private async checkCacheService(): Promise<HealthCheck> {
    const startTime = Date.now();
    const isHealthy = Math.random() > 0.1; // 90% chance of being healthy
    const responseTime = Date.now() - startTime + Math.random() * 80;

    if (isHealthy) {
      return {
        name: 'Cache Service',
        status: 'OK',
        responseTime,
      };
    } else {
      return {
        name: 'Cache Service',
        status: 'Degraded',
        details: 'Simulated cache degradation',
        responseTime,
      };
    }
  }

  private async checkBackgroundJobs(): Promise<HealthCheck> {
    const startTime = Date.now();
    const isHealthy = Math.random() > 0.05; // 95% chance of being healthy
    const responseTime = Date.now() - startTime + Math.random() * 150;

    if (isHealthy) {
      return {
        name: 'Background Jobs',
        status: 'OK',
        responseTime,
      };
    } else {
      return {
        name: 'Background Jobs',
        status: 'Error',
        details: 'Simulated job failure',
        responseTime,
      };
    }
  }

  private async checkEmailService(): Promise<HealthCheck> {
    const startTime = Date.now();
    const isHealthy = Math.random() > 0.3; // 70% chance of being healthy
    const responseTime = Date.now() - startTime + Math.random() * 200;

    if (isHealthy) {
      return {
        name: 'Email Service',
        status: 'OK',
        responseTime,
      };
    } else {
      return {
        name: 'Email Service',
        status: 'Error',
        details: 'Simulated email service outage',
        responseTime,
      };
    }
  }
}
