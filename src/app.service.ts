import { CookieJar, jar } from 'request';

import { Injectable, Scope } from '@nestjs/common';

@Injectable({
  scope: Scope.DEFAULT,
})
export class AppService {
  private currentSession: CookieJar;

  public constructor() {
    this.currentSession = jar();
  }

  public setCurrentSession(cookie: CookieJar): void {
    this.currentSession = cookie;
  }

  public getCurrentSession(): CookieJar {
    return this.currentSession;
  }
}