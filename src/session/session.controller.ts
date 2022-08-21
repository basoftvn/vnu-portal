import { green, yellow } from 'chalk';
import { Command, Option, Positional } from 'nestjs-command';

import { Injectable } from '@nestjs/common';

import { declaration } from './session.declaration';
import { SessionService } from './session.service';

@Injectable()
export class SessionController {
  public constructor(private readonly sessionService: SessionService) {}

  @Command(declaration.login.command)
  public async loginSession(
    @Positional(declaration.login.positionals.username)
    username: string,
    @Positional(declaration.login.positionals.password)
    password: string,
    @Option(declaration.login.options.force)
    force: boolean,
  ): Promise<void> {
    console.clear();

    console.log(yellow('Đã tạo phiên đăng nhập mới...'));

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

    await this.sessionService.login(username, password, force);

    console.log(green('Đăng nhập thành công'));
  }
}
