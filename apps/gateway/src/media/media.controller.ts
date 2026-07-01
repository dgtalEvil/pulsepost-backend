import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';

@Controller('media')
export class MediaController {
  constructor(private readonly proxy: ProxyService) {}

  @Post()
  async createMedia(@Body() body: any, @Res() res: Response) {
    const result = await this.proxy.toMedia('POST', '/media', body);
    return res.status(result.status).json(result.data);
  }
}
