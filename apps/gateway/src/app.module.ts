import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { EngagementModule } from './engagement/engagement.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [PostsModule, EngagementModule, MediaModule],
})
export class AppModule {}
