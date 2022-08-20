import { CommandModule } from 'nestjs-command';

import { Module } from '@nestjs/common';

@Module({
  imports: [CommandModule],
})
export class AppModule {}
