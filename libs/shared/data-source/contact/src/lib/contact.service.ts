import { inject, Injectable } from '@angular/core';
import { ISendContactMessageGQL } from './graphql/contact.generated';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private sendContactMessageGQL = inject(ISendContactMessageGQL);

  async sendContactMessage(input: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    const result = await this.sendContactMessageGQL
      .mutate({ variables: { input } })
      .toPromise();
    return result?.data?.sendContactMessage ?? false;
  }
}
