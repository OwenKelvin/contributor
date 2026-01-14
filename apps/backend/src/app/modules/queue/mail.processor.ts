import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';

@Processor('email')
export class MailProcessor {
  private readonly logger = new Logger(MailProcessor.name);

  @Process('sendWelcomeEmail')
  async sendWelcomeEmail(job: Job<{ to: string; name: string }>) {
    this.logger.debug(`Sending welcome email to ${job.data.to}`);
    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 3000));
    this.logger.debug(`Welcome email sent to ${job.data.to}`);
    return {};
  }
}
