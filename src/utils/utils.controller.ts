import { Command } from 'nestjs-command';

import { Injectable } from '@nestjs/common';

import { declaration } from './utils.declaration';

@Injectable()
export class UtilsController {
  @Command(declaration.clear.command)
  public clear(): void {
    console.clear();
  }

  @Command(declaration.exit.command)
  public exit(): void {
    process.exit(0);
  }
}
