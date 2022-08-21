import { CommandModule } from 'nestjs-command';

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { CreditModule } from './credit/credit.module';
import { SessionModule } from './session/session.module';
import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [
    CommandModule,
    CreditModule,
    SessionModule,
    UtilsModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
