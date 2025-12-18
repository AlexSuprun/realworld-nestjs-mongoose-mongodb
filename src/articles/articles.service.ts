import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from '../schemas/article.schema';
import { Comment } from '../schemas/comment.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { castToProfile, ProfileDto } from '../profiles/dto';
import {
  ArticleForCreateDto,
  ArticleForUpdateDto,
  castToArticle,
  castToCommentDto,
  CommentForCreateDto,
} from './dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<Article>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findArticles(
    user: UserDocument,
    tag: string,
    author: string,
    favorited?: string,
    limit = 10,
    offset = 0,
  ) {
    const query: Record<string, unknown> = {};

    if (author) {
      const authorUser = await this.userModel.findOne({ username: author }).exec();
      if (authorUser) {
        query.authorId = authorUser._id;
      }
    }

    let articles = await this.articleModel
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    // Get authors for all articles
    const authorIds = [...new Set(articles.map((a) => a.authorId.toString()))];
    const authors = await this.userModel
      .find({ _id: { $in: authorIds } })
      .exec();
    const authorMap = new Map(authors.map((a) => [a._id.toString(), a]));

    if (tag) {
      articles = articles.filter((article) =>
        article.tagList.some((t) => t === tag),
      );
    }

    if (favorited) {
      const favouritedUser = await this.userModel
        .findOne({ username: favorited })
        .exec();
      if (favouritedUser) {
        articles = articles.filter((article) =>
          article.favouritedUserIds.some(
            (id) => id.toString() === favouritedUser._id.toString(),
          ),
        );
      } else {
        throw new NotFoundException(`user ${favorited} not found`);
      }
    }

    const articlesDto = articles.map((article) => {
      const articleAuthor = authorMap.get(article.authorId.toString());
      const following =
        articleAuthor?.followersIds.some(
          (id) => id.toString() === user?._id?.toString(),
        ) || false;
      let authorProfile: ProfileDto;
      if (!articleAuthor) authorProfile = null;
      else authorProfile = castToProfile(articleAuthor, following);
      return castToArticle(article, user, article.tagList, authorProfile);
    });
    return articlesDto;
  }

  async findArticle(user: UserDocument, slug: string) {
    const article = await this.articleModel.findOne({ slug }).exec();
    if (article === null) throw new NotFoundException('article not found');

    const author = await this.userModel.findById(article.authorId).exec();
    const following =
      author?.followersIds?.some(
        (id) => id.toString() === user?._id?.toString(),
      ) || false;

    const authorProfile = castToProfile(author, following);
    return castToArticle(article, user, article.tagList, authorProfile);
  }

  async getUserFeed(user: UserDocument, limit: number, offset: number) {
    const articles = await this.articleModel
      .find()
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    // Get authors for all articles
    const authorIds = [...new Set(articles.map((a) => a.authorId.toString()))];
    const authors = await this.userModel
      .find({ _id: { $in: authorIds } })
      .exec();
    const authorMap = new Map(authors.map((a) => [a._id.toString(), a]));

    // Filter articles where user follows the author
    const feedArticles = articles.filter((article) => {
      const articleAuthor = authorMap.get(article.authorId.toString());
      if (!articleAuthor) return false;
      return articleAuthor.followersIds.some(
        (id) => id.toString() === user._id.toString(),
      );
    });

    const articlesDto = feedArticles.map((article) => {
      const articleAuthor = authorMap.get(article.authorId.toString());
      const authorProfile = castToProfile(articleAuthor, true);
      return castToArticle(article, user, article.tagList, authorProfile);
    });
    return articlesDto;
  }

  async createArticle(user: UserDocument, articletoCreate: ArticleForCreateDto) {
    const slug = articletoCreate.title.split(' ').join('-');
    try {
      const article = await new this.articleModel({
        ...articletoCreate,
        authorId: user._id,
        slug: slug,
        favouritedUserIds: [user._id],
        tagList: articletoCreate.tagList || [],
      }).save();
      return castToArticle(
        article,
        user,
        article.tagList,
        castToProfile(user, false),
      );
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException('bad request');
      }
      throw error;
    }
  }

  async updateArticle(
    user: UserDocument,
    slug: string,
    dto: ArticleForUpdateDto,
  ) {
    const article = await this.articleModel
      .findOneAndUpdate({ slug }, { ...dto }, { new: true })
      .exec();

    if (!article) throw new NotFoundException('article not found');

    const author = await this.userModel.findById(article.authorId).exec();
    return castToArticle(
      article,
      user,
      article.tagList,
      castToProfile(author, false),
    );
  }

  async deleteArticle(slug: string) {
    const article = await this.articleModel.findOne({ slug }).exec();
    if (!article) throw new NotFoundException('article not found');
    await this.articleModel.deleteOne({ slug }).exec();
    // Also delete comments for this article
    await this.commentModel.deleteMany({ articleId: article._id }).exec();
    return;
  }

  async addCommentToArticle(
    user: UserDocument,
    slug: string,
    dto: CommentForCreateDto,
  ) {
    const article = await this.articleModel.findOne({ slug }).exec();
    if (!article) throw new NotFoundException('article not found');
    const comment = await new this.commentModel({
      articleId: article._id,
      body: dto.body,
      authorId: user._id,
    }).save();
    return castToCommentDto(comment, castToProfile(user, false));
  }

  async getCommentsForArticle(slug: string) {
    const article = await this.articleModel.findOne({ slug }).exec();
    if (article === null) throw new NotFoundException('article not found');

    const comments = await this.commentModel
      .find({ articleId: article._id })
      .exec();

    // Get all comment authors
    const authorIds = [...new Set(comments.map((c) => c.authorId.toString()))];
    const authors = await this.userModel
      .find({ _id: { $in: authorIds } })
      .exec();
    const authorMap = new Map(authors.map((a) => [a._id.toString(), a]));

    return comments.map((comment) => {
      const commentAuthor = authorMap.get(comment.authorId.toString());
      return castToCommentDto(comment, castToProfile(commentAuthor, false));
    });
  }

  async deleteCommentForArticle(slug: string, id: string) {
    const article = await this.articleModel.findOne({ slug }).exec();
    if (!article) throw new NotFoundException('article not found');

    const result = await this.commentModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('comment not found');
    }
  }

  async favouriteArticle(user: UserDocument, slug: string) {
    let article = await this.articleModel.findOne({ slug }).exec();
    if (!article) throw new NotFoundException('article not found');

    const alreadyFavorited = article.favouritedUserIds.some(
      (id) => id.toString() === user._id.toString(),
    );

    if (!alreadyFavorited) {
      article = await this.articleModel
        .findOneAndUpdate(
          { slug },
          { $push: { favouritedUserIds: user._id } },
          { new: true },
        )
        .exec();
    }

    const author = await this.userModel.findById(article.authorId).exec();
    const following =
      author?.followersIds.some(
        (id) => id.toString() === user._id.toString(),
      ) || false;
    return castToArticle(
      article,
      user,
      article.tagList,
      castToProfile(author, following),
    );
  }

  async unfavouriteArticle(user: UserDocument, slug: string) {
    const article = await this.articleModel
      .findOneAndUpdate(
        { slug },
        { $pull: { favouritedUserIds: user._id } },
        { new: true },
      )
      .exec();

    if (!article) throw new NotFoundException('article not found');

    const author = await this.userModel.findById(article.authorId).exec();
    const isFollowing =
      author?.followersIds.some(
        (id) => id.toString() === user._id.toString(),
      ) || false;
    return castToArticle(
      article,
      user,
      article.tagList,
      castToProfile(author, isFollowing),
    );
  }
}
