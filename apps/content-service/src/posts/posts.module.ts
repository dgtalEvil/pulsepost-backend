import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { MediaProcessedConsumer } from '../rabbitmq/media-processed.consumer';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), RabbitmqModule],
  providers: [PostsService, MediaProcessedConsumer],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
