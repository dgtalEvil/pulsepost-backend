import { Injectable } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { Comment } from '../comments/comment.entity';
import { Like } from '../likes/like.entity';

@Injectable()
export class RabbitmqPublisher {
  constructor(private readonly rabbitmq: RabbitmqService) {}

  publishCommentCreated(comment: Comment) {
    const payload = {
      commentId: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      body: comment.body,
      createdAt: comment.createdAt,
    };
    this.rabbitmq.channel.publish(
      'pulsepost_events',
      'comment.created',
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );
  }

  publishLikeAdded(like: Like) {
    const payload = {
      likeId: like.id,
      postId: like.postId,
      authorId: like.authorId,
      createdAt: like.createdAt,
    };
    this.rabbitmq.channel.publish(
      'pulsepost_events',
      'like.added',
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );
  }
}
