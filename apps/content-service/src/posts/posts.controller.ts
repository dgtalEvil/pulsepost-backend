import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(
    @Body() body: Omit<CreatePostDto, 'authorId'>,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.postsService.create({ ...body, authorId: userId });
  }

  @Get()
  findAll() {
    return this.postsService.findAllPublished();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }
}
