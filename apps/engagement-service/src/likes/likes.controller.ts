import { Controller, Post, Body, Headers, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() body: Omit<CreateLikeDto, 'authorId'>,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.likesService.create({ ...body, authorId: userId });
  }
}
