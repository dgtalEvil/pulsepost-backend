import { Injectable } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';

interface MediaProcessedPayload {
  mediaId: string;
  postId: string;
  status: string;
  url?: string;
}

@Injectable()
export class RabbitmqPublisher {
  constructor(private readonly rabbitmq: RabbitmqService) {}

  publishMediaProcessed(payload: MediaProcessedPayload) {
    this.rabbitmq.channel.publish(
      'pulsepost_events',
      'media.processed',
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );
  }
}
