import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private connection: amqplib.ChannelModel;
  private _channel: amqplib.Channel;
  private readonly logger = new Logger(RabbitmqService.name);

  async onModuleInit() {
    this.connection = await amqplib.connect(
      process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    );
    this._channel = await this.connection.createChannel();
    await this._channel.assertExchange('pulsepost_events', 'topic', { durable: true });
    await this._channel.assertQueue('content-service-queue', { durable: true });
    await this._channel.bindQueue('content-service-queue', 'pulsepost_events', 'media.processed');
    this.logger.log('Connected to RabbitMQ');
  }

  get channel(): amqplib.Channel {
    return this._channel;
  }
}
