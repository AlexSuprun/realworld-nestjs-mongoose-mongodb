import { ArticleDocument } from '../../schemas/article.schema';
import { UserDocument } from '../../schemas/user.schema';
import { ProfileDto } from '../../profiles/dto';

export interface ArticleForCreateDto {
  title: string;
  description: string;
  body: string;
  tagList?: string[];
}

export interface ArticleForUpdateDto {
  title?: string;
  description?: string;
  body?: string;
}

export interface ArticleDto {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList?: string[];
  favoritesCount: number;
  author: ProfileDto;
  favorited: boolean;
  createdAt: Date;
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
