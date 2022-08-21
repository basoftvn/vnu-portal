import { SessionModule } from 'src/session/session.module';

import { Module } from '@nestjs/common';

import { CreditController } from './credit.controller';
import { CreditService } from './credit.service';

@Module({
  imports: [SessionModule],
  providers: [CreditController, CreditService],
})
export class CreditModule {}
