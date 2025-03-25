import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [TerminusModule, SharedModule],
  controllers: [HealthController],
})
export class HealthModule {}
