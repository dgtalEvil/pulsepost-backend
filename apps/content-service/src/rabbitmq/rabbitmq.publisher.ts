import { Injectable } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { Post } from '../posts/post.entity';

@Injectable()
export class RabbitmqPublisher {
  constructor(private readonly rabbitmq: RabbitmqService) {}

  publishPostCreated(post: Post) {
    const payload = {
      postId: post.id,
      authorId: post.authorId,
      title: post.title,
      status: post.status,
      createdAt: post.createdAt,
    };
    this.rabbitmq.channel.publish(
      'pulsepost_events',
      'post.created',
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );
  }
}
