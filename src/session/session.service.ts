import { red, yellow } from 'chalk';
import { load } from 'cheerio';
import { stringify } from 'querystring';
import { jar } from 'request';
import { Endpoints } from 'src/constants/endpoints';
import { wait } from 'src/helpers/wait';

import { Injectable, Scope } from '@nestjs/common';

import { SessionStoreService } from './session-store.service';

import request = require('request-promise-native');

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

    let requestVerificationToken: string;
    let retryCounter = 0;

    do {
      try {
        const loginPage = await request(Endpoints.Login, {
          method: 'GET',
          jar: newSession,
        });

        const $loginPage = load(loginPage);

        requestVerificationToken = $loginPage(
          '[name=__RequestVerificationToken]',
        ).val() as string;
      } catch (err) {
        if (!force) throw err;

        console.log(
          `${red('Đăng nhập không thành công, thử lại lần')} ${yellow(
            ++retryCounter,
          )}`,
        );

        await wait();
      }
    } while (force);

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

        console.log(
          `${red('Đăng nhập không thành công, thử lại lần')} ${yellow(
            ++retryCounter,
          )}`,
        );

        await wait();
      }
    } while (force);

    const currentSession = this.sessionStoreService.getCurrentSession();
    currentSession.setCredentials({ username, password });
    currentSession.setCookieJar(newSession);
  }

  public async wakeSession(): Promise<void> {
    const currentSession = this.sessionStoreService.getCurrentSession();
    const credentials = currentSession.getCredentials();

    if (credentials.username === null || credentials.password === null) return;

    try {
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
      console.error(red('Duy trì phiên đăng nhập thất bại'));
      console.error(yellow('Có lẽ bạn sẽ cần đăng nhập lại'));
    }
  }
}
