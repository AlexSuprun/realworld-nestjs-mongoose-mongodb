import { ProfileDto } from '../../profiles/dto';
import { CommentDocument } from '../../schemas/comment.schema';

export interface CommentForCreateDto {
  body: string;
}

export interface CommentDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  body: string;
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
