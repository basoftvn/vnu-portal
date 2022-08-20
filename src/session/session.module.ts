import { Module } from '@nestjs/common';

import { SessionStoreService } from './session-store.service';
import { SessionService } from './session.service';

@Module({
  providers: [SessionService, SessionStoreService],
  exports: [SessionStoreService],
})
export class SessionModule {}
