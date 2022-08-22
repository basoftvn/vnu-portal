import { load } from 'cheerio';
import { stringify } from 'querystring';
import { jar } from 'request';
import { Endpoints } from 'src/constants/endpoints';

import { Injectable, Scope } from '@nestjs/common';

import { SessionStoreService } from './session-store.service';

import request = require('request-promise-native');
import { sleep } from 'src/helpers/sleep';
import { bySeconds } from 'src/helpers/timespan';

@Injectable({
  scope: Scope.DEFAULT,
})
export class SessionService {
  public constructor(
    private readonly sessionStoreService: SessionStoreService,
  ) {
    setInterval(this.wakeSession.bind(this), 60000);
  }

  public async login(
    username: string,
    password: string,
    force: boolean,
  ): Promise<void> {
    const newSession = jar();

    const loginPage = await request(Endpoints.Login, {
      method: 'GET',
      jar: newSession,
    });

    const $loginPage = load(loginPage);

    const requestVerificationToken = $loginPage(
      '[name=__RequestVerificationToken]',
    ).val();

    do {
      try {
        await request(Endpoints.Login, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: stringify({
            LoginName: username,
            Password: password,
            __RequestVerificationToken: requestVerificationToken,
          }),
          jar: newSession,
          followAllRedirects: true,
        });
      } catch (err) {
        if (!force) throw err;

        // sleep from 2-5 seconds
        await sleep(Math.random() * bySeconds(3) + bySeconds(2));
      }
    } while (force);

    this.sessionStoreService.setCurrentSessionCookies(newSession);
  }

  public async wakeSession(): Promise<void> {
    const currentSession = this.sessionStoreService.getCurrentSession();
    const credentials = currentSession.getCredentials();

    if (credentials.username === null || credentials.password === null) return;

    try {
      console.log('called');
      const res = await request(Endpoints.Origin, {
        method: 'GET',
        jar: this.sessionStoreService.getCurrentSession().getCookieJar(),
        followAllRedirects: true,
      });

      if (res.includes('#LoginName')) {
        console.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        return;
      }
    } catch (err) {
      console.error(err.message);
    }
  }
}
