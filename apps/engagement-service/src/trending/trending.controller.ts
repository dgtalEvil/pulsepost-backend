import { Controller, Get } from '@nestjs/common';
import { TrendingService } from './trending.service';

@Controller('trending')
export class TrendingController {
  constructor(private readonly trendingService: TrendingService) {}

  @Get()
  getTrending() {
    return this.trendingService.getTopN(10);
  }
}
