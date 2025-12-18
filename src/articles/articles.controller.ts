import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserDocument } from '../schemas/user.schema';
import { AllowAny, GetUser } from '../common/decorator';
import { JwtGuard } from '../common/guard';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private articleService: ArticlesService) {}

  @Get()
  @UseGuards(JwtGuard)
  @AllowAny()
  async getAllArticles(
    @GetUser() user: UserDocument,
    //filter by tag
    @Query('tag') tag?: string,
    //filter by author
    @Query('author') author?: string,
    //favorited by user
    @Query('favorited') favorited?: string,
    //limit number of articles returned
    @Query('limit') limit = 10,
    //skip number of articles
    @Query('offset') offset = 0,
  ) {
    const articles = await this.articleService.findArticles(
      user,
      tag,
      author,
      favorited,
      limit,
      offset,
    );
    return {
      articles: articles,
      articlesCount: articles.length,
    };
  }

  @UseGuards(JwtGuard)
  @Get('feed')
  async getUserFeed(
    @GetUser() user: UserDocument,
    @Query('limit') limit = 10,
    @Query('offset') offset = 0,
  ) {
    const articles = await this.articleService.getUserFeed(user, limit, offset);
    return {
      articles: articles,
      articlesCount: articles.length,
    };
  }

  @Get(':slug')
  async getArticle(@GetUser() user: UserDocument, @Param('slug') slug: string) {
    return { article: await this.articleService.findArticle(user, slug) };
  }

  @UseGuards(JwtGuard)
  @Post()
  async createArticle(@GetUser() user: UserDocument, @Body('article') dto) {
    return {
      article: await this.articleService.createArticle(user, dto),
    };
  }

  @UseGuards(JwtGuard)
  @Put(':slug')
  async updateArticle(
    @GetUser() user: UserDocument,
    @Param('slug') slug: string,
    @Body() dto,
  ) {
    return {
      article: await this.articleService.updateArticle(user, slug, dto.article),
    };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtGuard)
  @Delete(':slug')
  deleteArticle(@Param('slug') slug: string) {
    return this.articleService.deleteArticle(slug);
  }

  @UseGuards(JwtGuard)
  @Post(':slug/comments')
  async addCommentToArticle(
    @GetUser() user: UserDocument,
    @Param('slug') slug: string,
    @Body() dto,
  ) {
    return {
      comment: await this.articleService.addCommentToArticle(
        user,
        slug,
        dto.comment,
      ),
    };
  }

  @Get(':slug/comments')
  async getCommentsForArticle(@Param('slug') slug: string) {
    return { comments: await this.articleService.getCommentsForArticle(slug) };
  }

  @UseGuards(JwtGuard)
  @Delete(':slug/comments/:id')
  deleteComment(@Param('slug') slug: string, @Param('id') id: string) {
    return this.articleService.deleteCommentForArticle(slug, id);
  }

  @UseGuards(JwtGuard)
  @Post(':slug/favorite')
  async favoriteArticle(@GetUser() user: UserDocument, @Param('slug') slug: string) {
    return { article: await this.articleService.favouriteArticle(user, slug) };
  }

  @UseGuards(JwtGuard)
  @Delete(':slug/favorite')
  async unfavoriteArticle(@GetUser() user: UserDocument, @Param('slug') slug: string) {
    return {
      article: await this.articleService.unfavouriteArticle(user, slug),
    };
  }
}
