import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { RabbitmqPublisher } from '../rabbitmq/rabbitmq.publisher';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepo: Repository<Comment>,
    private readonly publisher: RabbitmqPublisher,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateCommentDto): Promise<Comment> {
    const rateLimitKey = `ratelimit:comment:${dto.postId}:${dto.authorId}`;
    const set = await this.redisService.client.set(rateLimitKey, '1', 'EX', 5, 'NX');
    if (set === null) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    const comment = this.commentsRepo.create(dto);
    const saved = await this.commentsRepo.save(comment);

    this.publisher.publishCommentCreated(saved);
    await this.redisService.client.zincrby('trending:posts', 1, dto.postId);

    return saved;
  }
}
