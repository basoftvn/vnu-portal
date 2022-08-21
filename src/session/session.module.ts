import { Module } from '@nestjs/common';

import { SessionStoreService } from './session-store.service';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  providers: [SessionService, SessionStoreService, SessionController],
  exports: [SessionStoreService],
})
export class SessionModule {}
