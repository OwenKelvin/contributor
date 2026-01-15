import { inject, Injectable } from '@angular/core';
import { ILoginGQL } from './auth.generated';
import { ILoginInput } from '@nyots/data-source';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loginGQL = inject(ILoginGQL);

  async login(credentials: ILoginInput) {
    const response = await firstValueFrom(
      this.loginGQL.mutate({
        variables: credentials,
      }),
    );
    if (response.data?.login.accessToken) {
      // Store tokens
      localStorage.setItem('accessToken', response.data?.login.accessToken);
      localStorage.setItem('refreshToken', response.data?.login.accessToken);

      // Store user info
      localStorage.setItem('user', JSON.stringify(response.data?.login.user));
    }
    return response;
  }
}
