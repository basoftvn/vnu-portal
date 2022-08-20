import { Command, Positional } from 'nestjs-command';
import { jar } from 'request';
import { yellow, green } from 'chalk';
import { AppService } from 'src/app.service';

import { Injectable } from '@nestjs/common';

import request = require('request-promise-native');

@Injectable()
export class SessionService {
  public constructor(private readonly appService: AppService) {}

  @Command({
    command: 'session login <username> <password>',
    describe: 'Đăng nhập vào trang đăng ký học',
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
    // await request('', {
    //   method: 'POST',
    //   headers: {},
    //   jar: newSession,
    // });

    console.log(green('Đăng nhập thành công'));
  }
}
