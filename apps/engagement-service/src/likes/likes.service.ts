import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Like } from './like.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { RabbitmqPublisher } from '../rabbitmq/rabbitmq.publisher';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepo: Repository<Like>,
    private readonly publisher: RabbitmqPublisher,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateLikeDto): Promise<Like> {
    try {
      const like = this.likesRepo.create(dto);
      const saved = await this.likesRepo.save(like);

      this.publisher.publishLikeAdded(saved);
      await this.redisService.client.zincrby('trending:posts', 1, dto.postId);

      return saved;
    } catch (err) {
      if (err instanceof QueryFailedError && (err as any).code === '23505') {
        throw new ConflictException('You have already liked this post');
      }
      throw err;
    }
  }
}
