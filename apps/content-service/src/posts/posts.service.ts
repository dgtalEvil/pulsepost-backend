import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { RabbitmqPublisher } from '../rabbitmq/rabbitmq.publisher';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepo: Repository<Post>,
    private readonly publisher: RabbitmqPublisher,
  ) {}

  async create(dto: CreatePostDto): Promise<Post> {
    const post = this.postsRepo.create({
      authorId: dto.authorId,
      title: dto.title,
      body: dto.body,
      mediaId: dto.mediaId || null,
      status: dto.mediaId ? PostStatus.DRAFT : PostStatus.PUBLISHED,
    });
    const saved = await this.postsRepo.save(post);
    this.publisher.publishPostCreated(saved);
    return saved;
  }

  async findAllPublished(): Promise<Post[]> {
    return this.postsRepo.find({
      where: { status: PostStatus.PUBLISHED },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }

  async updateStatusFromMedia(postId: string, status: PostStatus): Promise<void> {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) return;
    if (post.status === PostStatus.PUBLISHED) return;
    post.status = status;
    await this.postsRepo.save(post);
  }
}
