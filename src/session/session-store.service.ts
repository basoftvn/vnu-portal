import { homedir } from 'os';
import { join } from 'path';
import { LoginSession } from 'src/models/login-session';

import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
export class SessionStoreService {
  private readonly rootPath: string;
  private currentSession: LoginSession;

  public constructor() {
    this.rootPath = join(homedir(), '.vnu-portal');

    this.currentSession = new LoginSession();
  }

  public getCurrentSession(): LoginSession {
    return this.currentSession;
  }
}
