import { Injectable, Scope } from '@nestjs/common';

import { ConsoleInput, ConsoleOutput } from '@supercharge/console-io';

@Injectable({
  scope: Scope.DEFAULT,
})
export class IoService {
  private readonly input: ConsoleInput;
  private readonly output: ConsoleOutput;

  public constructor() {
    this.input = new ConsoleInput();
    this.output = new ConsoleOutput();
  }

  public async input__ask<T extends string>(
    prompt: string,
    callback?: (qb) => unknown,
  ): Promise<T> {
    process.stdin.setRawMode(true);

    const result = await this.input.ask<T>(prompt, callback);

    process.stdin.setRawMode(false);

    return result;
  }

  public async input__password(
    prompt: string,
    callback?: (sib) => unknown,
  ): Promise<string> {
    process.stdin.setRawMode(true);

    const result = await this.input.password(prompt, callback);

    process.stdin.setRawMode(false);

    return result;
  }
}
