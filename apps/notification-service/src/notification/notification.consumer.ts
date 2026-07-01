import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class NotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(private readonly rabbitmq: RabbitmqService) {}

  async onModuleInit() {
    const channel = this.rabbitmq.channel;
    await channel.assertQueue('notification-service-queue', { durable: true });
    await channel.bindQueue('notification-service-queue', 'pulsepost_events', 'post.created');
    await channel.bindQueue('notification-service-queue', 'pulsepost_events', 'comment.created');
    await channel.bindQueue('notification-service-queue', 'pulsepost_events', 'like.added');
    await channel.bindQueue('notification-service-queue', 'pulsepost_events', 'media.processed');

    channel.consume('notification-service-queue', (msg) => {
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content.toString());
        const routingKey = msg.fields.routingKey;
        switch (routingKey) {
          case 'post.created':
            this.handlePostCreated(payload);
            break;
          case 'comment.created':
            this.handleCommentCreated(payload);
            break;
          case 'like.added':
            this.handleLikeAdded(payload);
            break;
          case 'media.processed':
            this.handleMediaProcessed(payload);
            break;
          default:
            this.logger.warn(`Unknown routing key: ${routingKey}`);
        }
      } catch (err) {
        this.logger.error(`Failed to process message: ${err.message}`);
      } finally {
        channel.ack(msg);
      }
    }, { noAck: false });

    this.logger.log('Consuming notification-service-queue');
  }

  private handlePostCreated(payload: any) {
    this.logger.log(`[Notification] New post by ${payload.authorId}: ${payload.title}`);
  }

  private handleCommentCreated(payload: any) {
    this.logger.log(`[Notification] New comment on post ${payload.postId} by ${payload.authorId}`);
  }

  private handleLikeAdded(payload: any) {
    this.logger.log(`[Notification] Post ${payload.postId} liked by ${payload.authorId}`);
  }

  private handleMediaProcessed(payload: any) {
    this.logger.log(`[Notification] Media ${payload.mediaId} processed: ${payload.status}`);
  }
}
