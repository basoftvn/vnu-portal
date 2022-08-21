import { CommandModule, CommandService } from 'nestjs-command';
import parse from 'string-argv';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import yargs = require('yargs');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  await app.init();

  try {
    const service = await app.select(CommandModule).get(CommandService);
    yargs.scriptName('').exitProcess(false);

    yargs.showHelp('log');

    process.stdout.write('> ');

    process.stdin.on('data', async (args) => {
      process.stdin.pause();

      try {
        await service.exec(parse(args.toString()));
      } catch (err) {
        console.error(err.message);
      }

      process.stdout.write('\n> ');

      process.stdin.resume();
    });
  } catch (error) {
    console.error(error);
  } finally {
    await app.close();
  }
}

bootstrap();
