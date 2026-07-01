import { Controller, Post, Get, Body, Headers, Param, HttpCode, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly proxy: ProxyService) {}

  @Post()
  async createPost(
    @Body() body: any,
    @Headers('x-user-id') userId: string,
    @Res() res: Response,
  ) {
    const headers = userId ? { 'x-user-id': userId } : {};
    const result = await this.proxy.toContent('POST', '/posts', body, headers);
    return res.status(result.status).json(result.data);
  }

  @Get()
  async getPosts(@Res() res: Response) {
    const result = await this.proxy.toContent('GET', '/posts');
    return res.status(result.status).json(result.data);
  }

  @Get(':id')
  async getPost(@Param('id') id: string, @Res() res: Response) {
    const result = await this.proxy.toContent('GET', `/posts/${id}`);
    return res.status(result.status).json(result.data);
  }
}
