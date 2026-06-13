import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { ContactMessageInput } from './contact.input';

@Injectable()
export class ContactService {
  constructor(private emailService: EmailService) {}

  async sendContactMessage(input: ContactMessageInput): Promise<boolean> {
    await this.emailService.sendContactEmail(
      input.email,
      input.name,
      input.subject,
      input.message
    );
    return true;
  }
}
