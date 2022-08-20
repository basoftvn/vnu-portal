import { Injectable } from '@nestjs/common';

import { Command, Positional } from 'nestjs-command';
import { AppService } from 'src/app.service';

@Injectable()
export class LoginService {
  public constructor(private readonly appService: AppService) {}

  @Command({
    command: 'login <username> <password>',
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
  }
}
