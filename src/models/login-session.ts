import { CookieJar, jar } from 'request';
import { Endpoints } from 'src/constants/endpoints';

import { Credentials } from './credentials';

export class LoginSession {
  private name: string;
  private readonly cookieJar: CookieJar;
  private readonly credentials: Credentials;

  public constructor() {
    this.cookieJar = jar();
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public getCookieJar(): CookieJar {
    return this.cookieJar;
  }

  public setCookieJar(cookieJar: CookieJar): void {
    const newCookies = cookieJar.getCookies(Endpoints.Origin);
    const oldCookies = this.cookieJar.getCookies(Endpoints.Origin);

    for (const cookie of oldCookies)
      this.cookieJar.setCookie(`${cookie.key}=`, Endpoints.Origin);

    for (const cookie of newCookies)
      this.cookieJar.setCookie(cookie, Endpoints.Origin);
  }
}
