import { CommandModule } from 'nestjs-command';

import { Global, Module } from '@nestjs/common';

import { AppService } from './app.service';
import { UtilsModule } from './utils/utils.module';
import { SessionModule } from './session/session.module';

@Global()
@Module({
  imports: [CommandModule, UtilsModule, SessionModule],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
