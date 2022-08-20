import { homedir } from 'os';
import { join } from 'path';
import { NamedSession } from 'src/models/named-session';

import { Injectable, Scope } from '@nestjs/common';
import { CookieJar } from 'request';

@Injectable({ scope: Scope.DEFAULT })
export class SessionStoreService {
  private readonly rootPath: string;
  private currentSession: NamedSession;

  public constructor() {
    this.rootPath = join(homedir(), '.vnu-portal');

    this.currentSession = new NamedSession();
  }

  public getCurrentSession(): NamedSession {
    return this.currentSession.clone();
  }

  public setCurrentSessionCookies(cookieJar: CookieJar): void {
    this.currentSession.setCookieJar(cookieJar);
  }
}
