import { Module } from '@nestjs/common';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { NotificationConsumer } from './notification.consumer';

@Module({
  imports: [RabbitmqModule],
  providers: [NotificationConsumer],
})
export class NotificationModule {}
