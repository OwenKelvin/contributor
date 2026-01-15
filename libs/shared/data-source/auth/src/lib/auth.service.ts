import { inject, Injectable } from '@angular/core';
import { ILoginGQL, IRegisterGQL } from './auth.generated';
import { ILoginInput, IRegisterInput } from '@nyots/data-source';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  loginGQL = inject(ILoginGQL);
  registerGQL = inject(IRegisterGQL);

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

  async register(registerInput: IRegisterInput) {
    const response = await firstValueFrom(
      this.registerGQL.mutate({
        variables: registerInput,
      }),
    );
    if (response.data?.register.accessToken) {
      // Store tokens
      localStorage.setItem('accessToken', response.data?.register.accessToken);
      localStorage.setItem('refreshToken', response.data?.register.accessToken);

      // Store user info
      localStorage.setItem('user', JSON.stringify(response.data?.register.user));
    }
    return response;
  }
}
