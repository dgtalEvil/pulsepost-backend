import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TrendingService {
  constructor(private readonly redisService: RedisService) {}

  async getTopN(n = 10): Promise<{ postId: string; score: number }[]> {
    const results = await this.redisService.client.zrevrange(
      'trending:posts',
      0,
      n - 1,
      'WITHSCORES',
    );

    const items: { postId: string; score: number }[] = [];
    for (let i = 0; i < results.length; i += 2) {
      items.push({ postId: results[i], score: parseFloat(results[i + 1]) });
    }
    return items;
  }
}
