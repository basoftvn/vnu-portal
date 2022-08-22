import { green, red, yellow } from 'chalk';
import { Command, Option } from 'nestjs-command';
import { IoService } from 'src/io/io.service';

import { Injectable } from '@nestjs/common';

import { declaration } from './session.declaration';
import { SessionService } from './session.service';

@Injectable()
export class SessionController {
  public constructor(
    private readonly sessionService: SessionService,
    private readonly ioService: IoService,
  ) {}

  @Command(declaration.login.command)
  public async loginSession(
    @Option(declaration.login.options.force)
    force: boolean,
    @Option(declaration.login.options.verbose)
    verbose: boolean,
  ): Promise<void> {
    const username = await this.ioService.input__ask('Mã sinh viên', null);
    const password = await this.ioService.input__password('    Mật khẩu', null);

    try {
      console.log(yellow('Đã tạo phiên đăng nhập mới...'));

      if (verbose)
        console.log(
          yellow(
            `Đang đăng nhập với tên đăng nhập "${username}", mật khẩu ${'*'.repeat(
              password.length,
            )}`,
          ),
        );

      if (force && verbose)
        console.log(
          yellow(
            'Bạn đã sử dụng flag --force, phiên đăng nhập sẽ được thử đến khi đăng nhập được hoặc server báo lỗi sai thông tin đăng nhập',
          ),
        );

      await this.sessionService.login(username, password, force);

      console.log(green('Đăng nhập thành công'));
    } catch (err) {
      if (verbose) console.error(red(err.message));

      console.error(red('Đăng nhập thất bại'));
    }
  }
}
