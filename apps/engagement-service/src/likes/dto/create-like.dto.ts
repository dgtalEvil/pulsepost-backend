import { IsString, IsNotEmpty } from 'class-validator';

export class CreateLikeDto {
  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  authorId: string;
}
