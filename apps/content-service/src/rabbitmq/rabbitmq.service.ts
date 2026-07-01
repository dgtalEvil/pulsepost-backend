import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private connection: amqplib.ChannelModel;
  private _channel: amqplib.Channel;
  private readonly logger = new Logger(RabbitmqService.name);

  async onModuleInit() {
    this.connection = await this.connectWithRetry();
    this._channel = await this.connection.createChannel();
    await this._channel.assertExchange('pulsepost_events', 'topic', { durable: true });
    await this._channel.assertQueue('content-service-queue', { durable: true });
    await this._channel.bindQueue('content-service-queue', 'pulsepost_events', 'media.processed');
    this.logger.log('Connected to RabbitMQ');
  }

  get channel(): amqplib.Channel {
    return this._channel;
  }

  private async connectWithRetry(retries = 10, delayMs = 3000): Promise<amqplib.ChannelModel> {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await amqplib.connect(url);
      } catch (err) {
        this.logger.warn(`RabbitMQ connection attempt ${attempt}/${retries} failed: ${err.message}`);
        if (attempt === retries) throw err;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw new Error('Unreachable');
  }
}
