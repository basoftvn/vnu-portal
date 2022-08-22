import { Global, Module } from '@nestjs/common';

import { IoService } from './io.service';

@Global()
@Module({
  providers: [IoService],
  exports: [IoService],
})
export class IoModule {}
