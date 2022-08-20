import { CommandModule } from 'nestjs-command';

import { Module } from '@nestjs/common';

import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [CommandModule, UtilsModule],
})
export class AppModule {}
