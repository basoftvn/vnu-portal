import { CommandModule, CommandService } from 'nestjs-command';
import parse from 'string-argv';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

import yargs = require('yargs');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const service = await app.select(CommandModule).get(CommandService);
    yargs.scriptName('');

    process.stdin.on('data', (args) => {
      service.exec(parse(args.toString()));
    });
  } catch (error) {
    console.error(error);
  } finally {
    await app.close();
  }
}

bootstrap();
