import { load } from 'cheerio';
import { stringify } from 'querystring';
import { jar } from 'request';
import { Endpoints } from 'src/constants/endpoints';

import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';

import { SessionStoreService } from './session-store.service';

import request = require('request-promise-native');

@Injectable()
export class SessionService {
  public constructor(
    private readonly sessionStoreService: SessionStoreService,
  ) {}

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

        break;
      } catch (err) {}
    } while (force);

    this.sessionStoreService.setCurrentSessionCookies(newSession);
  }

  @Interval(5)
  public async wakeSession(): Promise<void> {
    console.log('called');
    return;

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
