import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { RabbitmqPublisher } from './rabbitmq.publisher';

@Module({
  providers: [RabbitmqService, RabbitmqPublisher],
  exports: [RabbitmqService, RabbitmqPublisher],
})
export class RabbitmqModule {}
