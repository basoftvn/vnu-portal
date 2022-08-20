import { CommandModule } from 'nestjs-command';

import { Global, Module } from '@nestjs/common';

import { AppService } from './app.service';
import { LoginModule } from './login/login.module';
import { UtilsModule } from './utils/utils.module';

@Global()
@Module({
  imports: [CommandModule, LoginModule, UtilsModule],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
