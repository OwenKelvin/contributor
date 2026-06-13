import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ContactService } from './contact.service';
import { ContactMessageInput } from './contact.input';

@Resolver()
export class ContactResolver {
  constructor(private contactService: ContactService) {}

  @Mutation(() => Boolean)
  async sendContactMessage(
    @Args('input') input: ContactMessageInput
  ): Promise<boolean> {
    return this.contactService.sendContactMessage(input);
  }
}
