import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  @IsNotEmpty()
  postId: string;
}
