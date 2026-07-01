import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaStatus } from './media.entity';
import { CreateMediaDto } from './dto/create-media.dto';
import { WebhookMediaDto } from './dto/webhook-media.dto';
import { RabbitmqPublisher } from '../rabbitmq/rabbitmq.publisher';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    private readonly publisher: RabbitmqPublisher,
  ) {}

  async create(dto: CreateMediaDto): Promise<Media> {
    const media = this.mediaRepo.create({ postId: dto.postId, status: MediaStatus.PENDING });
    const saved = await this.mediaRepo.save(media);
    this.triggerMockProcessor(saved);
    return saved;
  }

  async processWebhook(dto: WebhookMediaDto): Promise<void> {
    const media = await this.mediaRepo.findOne({ where: { id: dto.mediaId } });
    if (!media) {
      this.logger.warn(`Media not found: ${dto.mediaId}`);
      return;
    }
    media.status = dto.status as MediaStatus;
    if (dto.url) media.url = dto.url;
    await this.mediaRepo.save(media);

    this.publisher.publishMediaProcessed({
      mediaId: media.id,
      postId: media.postId,
      status: media.status,
      url: media.url,
    });
    this.logger.log(`Media ${media.id} processed: ${media.status}`);
  }

  private triggerMockProcessor(media: Media): void {
    const port = process.env.PORT || 3003;
    const secret = process.env.MEDIA_WEBHOOK_SECRET || 'mock-secret';

    setTimeout(async () => {
      const success = Math.random() > 0.5;
      const payload = success
        ? { mediaId: media.id, postId: media.postId, status: 'ready', url: `https://cdn.mock/${media.id}.jpg` }
        : { mediaId: media.id, postId: media.postId, status: 'failed' };

      try {
        await fetch(`http://localhost:${port}/webhooks/media`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': secret,
          },
          body: JSON.stringify(payload),
        });
        this.logger.log(`Mock processor called webhook for media ${media.id}: ${payload.status}`);
      } catch (err) {
        this.logger.error(`Mock processor failed to call webhook: ${err.message}`);
      }
    }, 3000);
  }
}
