import { Module } from '@nestjs/common';
import { ProxyModule } from '../proxy/proxy.module';
import { MediaController } from './media.controller';

@Module({
  imports: [ProxyModule],
  controllers: [MediaController],
})
export class MediaModule {}
