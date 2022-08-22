import { CommandModule } from 'nestjs-command';

import { Module } from '@nestjs/common';

import { CreditModule } from './credit/credit.module';
import { IoModule } from './io/io.module';
import { SessionModule } from './session/session.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [CommandModule, CreditModule, SessionModule, UtilsModule, IoModule],
})
export class AppModule {}
