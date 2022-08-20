import { Command, Positional, Option } from 'nestjs-command';
import { jar } from 'request';
import { yellow, green } from 'chalk';

import { Injectable } from '@nestjs/common';

import request = require('request-promise-native');
import { SessionStoreService } from './session-store.service';
import { Endpoints } from 'src/constants/endpoints';
import { load } from 'cheerio';
import { stringify } from 'querystring';

@Injectable()
export class SessionService {
  public constructor(
    private readonly sessionStoreService: SessionStoreService,
  ) {}

  @Command({
    command: 'session:login <username> <password>',
    describe: 'Đăng nhập vào trang đăng ký học bằng một phiên mới',
  })
  public async login(
    @Positional({
      name: 'username',
      alias: 'u',
      describe: 'Tên đăng nhập (mã số sinh viên)',
      type: 'string',
    })
    username: string,
    @Positional({
      name: 'password',
      alias: 'p',
      describe: 'Mật khẩu',
      type: 'string',
    })
    password: string,
    @Option({
      name: 'force',
      alias: 'f',
      describe: 'Thử lại đăng nhập đến khi được',
      type: 'boolean',
      default: false,
    })
    force: boolean,
  ): Promise<void> {
    console.clear();

    console.log(yellow('Đã tạo phiên đăng nhập mới...'));
    const newSession = jar();

    console.log(
      yellow(
        `Đang đăng nhập với tên đăng nhập "${username}", mật khẩu ${'*'.repeat(
          password.length,
        )}`,
      ),
    );

    if (force)
      console.log(
        yellow(
          'Bạn đã sử dụng flag --force, phiên đăng nhập sẽ được thử đến khi đăng nhập được hoặc server báo lỗi sai thông tin đăng nhập',
        ),
      );

    const loginPage = await request(Endpoints.Login, {
      method: 'GET',
      jar: newSession,
    });

    const $loginPage = load(loginPage);

    const requestVerificationToken = $loginPage(
      '[name=__RequestVerificationToken]',
    ).val();

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

    this.sessionStoreService.setCurrentSessionCookies(newSession);

    console.log(green('Đăng nhập thành công'));
  }
}
