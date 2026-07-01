import { Module } from '@nestjs/common';
import { ProxyModule } from '../proxy/proxy.module';
import { PostsController } from './posts.controller';

@Module({
  imports: [ProxyModule],
  controllers: [PostsController],
})
export class PostsModule {}
