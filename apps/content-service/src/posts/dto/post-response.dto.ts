export class PostResponseDto {
  id: string;
  authorId: string;
  title: string;
  body: string;
  mediaId: string | null;
  status: string;
  createdAt: Date;
}
