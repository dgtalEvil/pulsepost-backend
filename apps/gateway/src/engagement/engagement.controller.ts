import { Controller, Post, Get, Body, Headers, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';

@Controller()
export class EngagementController {
  constructor(private readonly proxy: ProxyService) {}

  @Post('comments')
  async createComment(
    @Body() body: any,
    @Headers('x-user-id') userId: string,
    @Res() res: Response,
  ) {
    const headers = userId ? { 'x-user-id': userId } : {};
    const result = await this.proxy.toEngagement('POST', '/comments', body, headers);
    return res.status(result.status).json(result.data);
  }

  @Post('likes')
  async createLike(
    @Body() body: any,
    @Headers('x-user-id') userId: string,
    @Res() res: Response,
  ) {
    const headers = userId ? { 'x-user-id': userId } : {};
    const result = await this.proxy.toEngagement('POST', '/likes', body, headers);
    return res.status(result.status).json(result.data);
  }

  @Get('trending')
  async getTrending(@Res() res: Response) {
    const result = await this.proxy.toEngagement('GET', '/trending');
    return res.status(result.status).json(result.data);
  }
}
