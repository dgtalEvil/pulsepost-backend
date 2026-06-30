import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { PostsService } from '../posts/posts.service';
import { PostStatus } from '../posts/post.entity';

@Injectable()
export class MediaProcessedConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitmq: RabbitmqService,
    private readonly postsService: PostsService,
  ) {}

  onModuleInit() {
    this.rabbitmq.channel.consume('content-service-queue', async (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString());
        const newStatus = event.status === 'ready' ? PostStatus.PUBLISHED : PostStatus.FAILED;
        await this.postsService.updateStatusFromMedia(event.postId, newStatus);
        this.rabbitmq.channel.ack(msg);
      } catch (err) {
        console.error('Failed to process media.processed event:', err);
        this.rabbitmq.channel.nack(msg, false, false);
      }
    });
  }
}
