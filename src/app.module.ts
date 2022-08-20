import { CommandModule } from 'nestjs-command';

import { Module } from '@nestjs/common';

import { CreditModule } from './credit/credit.module';
import { SessionModule } from './session/session.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [CommandModule, UtilsModule, SessionModule, CreditModule],
})
export class AppModule {}
