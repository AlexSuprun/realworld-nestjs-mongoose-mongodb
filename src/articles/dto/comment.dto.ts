import { ApiProperty } from '@nestjs/swagger';
import { ProfileDto } from '../../profiles/dto';
import { CommentDocument } from '../../schemas/comment.schema';

export class CommentForCreateDto {
  @ApiProperty({ example: 'This is a comment' })
  body: string;
}

export class CommentDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: '2021-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2021-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: 'This is a comment' })
  body: string;

  @ApiProperty({ type: ProfileDto })
  author: ProfileDto;
}

export function castToCommentDto(
  comment: CommentDocument,
  author: ProfileDto,
): CommentDto {
  return {
    id: comment._id.toString(),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    body: comment.body,
    author: author,
  };
}
