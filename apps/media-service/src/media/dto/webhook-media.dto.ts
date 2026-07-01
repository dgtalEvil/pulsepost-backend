import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class WebhookMediaDto {
  @IsString()
  @IsNotEmpty()
  mediaId: string;

  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  url?: string;
}
