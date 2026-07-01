import { Controller, Post, Body, Headers, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { MediaService } from './media.service';
import { WebhookMediaDto } from './dto/webhook-media.dto';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('media')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Headers('x-webhook-secret') secret: string,
    @Body() dto: WebhookMediaDto,
  ) {
    const expectedSecret = process.env.MEDIA_WEBHOOK_SECRET || 'mock-secret';
    if (!secret || secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
    await this.mediaService.processWebhook(dto);
    return { ok: true };
  }
}
