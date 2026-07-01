import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Media } from './media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { WebhookController } from './webhook.controller';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [TypeOrmModule.forFeature([Media]), RabbitmqModule],
  providers: [MediaService],
  controllers: [MediaController, WebhookController],
})
export class MediaModule {}
