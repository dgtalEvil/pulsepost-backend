import { Module } from '@nestjs/common';
import { ProxyModule } from '../proxy/proxy.module';
import { EngagementController } from './engagement.controller';

@Module({
  imports: [ProxyModule],
  controllers: [EngagementController],
})
export class EngagementModule {}
