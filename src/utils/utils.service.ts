import { Command } from 'nestjs-command';

import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  @Command({
    command: 'clear',
    describe: 'Xoá màn hình',
  })
  public clear(): void {
    console.clear();
  }

  @Command({
    command: 'exit',
    describe: 'Thoát',
  })
  public exit(): void {
    process.exit(0);
  }
}
