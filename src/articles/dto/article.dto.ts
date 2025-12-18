import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleDocument } from '../../schemas/article.schema';
import { UserDocument } from '../../schemas/user.schema';
import { ProfileDto } from '../../profiles/dto';

export class ArticleForCreateDto {
  @ApiProperty({ example: 'How to train your dragon' })
  title: string;

  @ApiProperty({ example: 'Ever wonder how?' })
  description: string;

  @ApiProperty({ example: 'It takes a Jacobian' })
  body: string;

  @ApiPropertyOptional({ example: ['dragons', 'training'], type: [String] })
  tagList?: string[];
}

export class ArticleForUpdateDto {
  @ApiPropertyOptional({ example: 'Updated title' })
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  description?: string;

  @ApiPropertyOptional({ example: 'Updated body' })
  body?: string;
}

export class ArticleDto {
  @ApiProperty({ example: 'how-to-train-your-dragon' })
  slug: string;

  @ApiProperty({ example: 'How to train your dragon' })
  title: string;

  @ApiProperty({ example: 'Ever wonder how?' })
  description: string;

  @ApiProperty({ example: 'It takes a Jacobian' })
  body: string;

  @ApiPropertyOptional({ example: ['dragons', 'training'], type: [String] })
  tagList?: string[];

  @ApiProperty({ example: 0 })
  favoritesCount: number;

  @ApiProperty({ type: ProfileDto })
  author: ProfileDto;

  @ApiProperty({ example: false })
  favorited: boolean;

  @ApiProperty({ example: '2021-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2021-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export function castToArticle(
  article: ArticleDocument,
  user: UserDocument,
  tags: string[],
  author: ProfileDto,
): ArticleDto {
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: tags,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    favorited:
      article.favouritedUserIds.some(
        (id) => id.toString() === user?._id?.toString(),
      ) || false,
    favoritesCount: article.favouritedUserIds.length,
    author: author,
  };
}
