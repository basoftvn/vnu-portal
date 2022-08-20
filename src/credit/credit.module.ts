import { Module } from '@nestjs/common';
import { SessionModule } from 'src/session/session.module';
import { CreditService } from './credit.service';

@Module({
  imports: [SessionModule],
  providers: [CreditService],
})
export class CreditModule {}
