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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserDocument } from '../schemas/user.schema';
import { AllowAny, GetUser } from '../common/decorator';
import { JwtGuard } from '../common/guard';
import { ArticlesService } from './articles.service';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private articleService: ArticlesService) {}

  @Get()
  @UseGuards(JwtGuard)
  @AllowAny()
  @ApiOperation({ summary: 'Get all articles' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  @ApiQuery({ name: 'author', required: false, description: 'Filter by author' })
  @ApiQuery({ name: 'favorited', required: false, description: 'Filter by favorited user' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of articles' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset/skip number of articles' })
  async getAllArticles(
    @GetUser() user: UserDocument,
    @Query('tag') tag?: string,
    @Query('author') author?: string,
    @Query('favorited') favorited?: string,
    @Query('limit') limit = 10,
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get feed articles from followed users' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of articles' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset/skip number of articles' })
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
  @ApiOperation({ summary: 'Get article by slug' })
  async getArticle(@GetUser() user: UserDocument, @Param('slug') slug: string) {
    return { article: await this.articleService.findArticle(user, slug) };
  }

  @UseGuards(JwtGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create article' })
  async createArticle(@GetUser() user: UserDocument, @Body('article') dto) {
    return {
      article: await this.articleService.createArticle(user, dto),
    };
  }

  @UseGuards(JwtGuard)
  @Put(':slug')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update article' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete article' })
  deleteArticle(@Param('slug') slug: string) {
    return this.articleService.deleteArticle(slug);
  }

  @UseGuards(JwtGuard)
  @Post(':slug/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add comment to article' })
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
  @ApiOperation({ summary: 'Get comments for article' })
  async getCommentsForArticle(@Param('slug') slug: string) {
    return { comments: await this.articleService.getCommentsForArticle(slug) };
  }

  @UseGuards(JwtGuard)
  @Delete(':slug/comments/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete comment' })
  deleteComment(@Param('slug') slug: string, @Param('id') id: string) {
    return this.articleService.deleteCommentForArticle(slug, id);
  }

  @UseGuards(JwtGuard)
  @Post(':slug/favorite')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Favorite article' })
  async favoriteArticle(@GetUser() user: UserDocument, @Param('slug') slug: string) {
    return { article: await this.articleService.favouriteArticle(user, slug) };
  }

  @UseGuards(JwtGuard)
  @Delete(':slug/favorite')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfavorite article' })
  async unfavoriteArticle(@GetUser() user: UserDocument, @Param('slug') slug: string) {
    return {
      article: await this.articleService.unfavouriteArticle(user, slug),
    };
  }
}
