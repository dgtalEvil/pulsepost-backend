import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comments/comment.entity';
import { Like } from './likes/like.entity';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { TrendingModule } from './trending/trending.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Comment, Like],
      synchronize: true,
    }),
    CommentsModule,
    LikesModule,
    TrendingModule,
  ],
})
export class AppModule {}
