import { Module } from '@nestjs/common';

import { UtilsController } from './utils.controller';

@Module({
  providers: [UtilsController],
})
export class UtilsModule {}
