import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import * as argon from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

import { User, UserSchema } from '../schemas/user.schema';
import { Article, ArticleSchema } from '../schemas/article.schema';
import { Comment, CommentSchema } from '../schemas/comment.schema';

// Interfaces for JSON data
interface SeedUser {
  id: string;
  email: string;
  username: string;
  password: string;
  bio: string;
  image: string;
  role: string;
  following: string[];
}

interface SeedArticle {
  id: string;
  title: string;
  slug: string;
  description: string;
  body: string;
  tagList: string[];
  authorId: string;
  favouritedBy: string[];
  createdAt: string;
}

interface SeedComment {
  id: string;
  body: string;
  authorId: string;
  articleId: string;
  createdAt: string;
}

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Article.name, schema: ArticleSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
})
class SeedModule {}

class Seeder {
  private userIdMap: Map<string, Types.ObjectId> = new Map();
  private articleIdMap: Map<string, Types.ObjectId> = new Map();

  constructor(
    private userModel: Model<User>,
    private articleModel: Model<Article>,
    private commentModel: Model<Comment>,
  ) {}

  private loadJson<T>(filename: string): T {
    const filePath = path.join(
      process.cwd(),
      'data',
      'seed',
      filename,
    );
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  async clearDatabase(): Promise<void> {
    console.log('🗑️  Clearing database...');
    await this.commentModel.deleteMany({});
    await this.articleModel.deleteMany({});
    await this.userModel.deleteMany({});
    console.log('✅ Database cleared');
  }

  async seedUsers(): Promise<void> {
    console.log('👤 Seeding users...');
    const users = this.loadJson<SeedUser[]>('users.json');

    for (const userData of users) {
      const hashedPassword = await argon.hash(userData.password);
      const objectId = new Types.ObjectId();
      this.userIdMap.set(userData.id, objectId);

      const user = new this.userModel({
        _id: objectId,
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        bio: userData.bio,
        image: userData.image,
        followersIds: [],
        followingIds: [],
        articlesLikedIds: [],
      });

      await user.save();
    }

    // Now update following relationships
    for (const userData of users) {
      if (userData.following && userData.following.length > 0) {
        const userId = this.userIdMap.get(userData.id);
        const followingIds = userData.following
          .map((id) => this.userIdMap.get(id))
          .filter((id): id is Types.ObjectId => id !== undefined);

        await this.userModel.updateOne(
          { _id: userId },
          { $set: { followingIds } },
        );

        // Update followers for each followed user
        for (const followedId of followingIds) {
          await this.userModel.updateOne(
            { _id: followedId },
            { $addToSet: { followersIds: userId } },
          );
        }
      }
    }

    console.log(`✅ Created ${users.length} users`);
  }

  async seedArticles(): Promise<void> {
    console.log('📝 Seeding articles...');
    const articles = this.loadJson<SeedArticle[]>('articles.json');

    for (const articleData of articles) {
      const objectId = new Types.ObjectId();
      this.articleIdMap.set(articleData.id, objectId);

      const authorId = this.userIdMap.get(articleData.authorId);
      if (!authorId) {
        console.warn(`⚠️  Author not found for article: ${articleData.title}`);
        continue;
      }

      const favouritedUserIds = articleData.favouritedBy
        .map((id) => this.userIdMap.get(id))
        .filter((id): id is Types.ObjectId => id !== undefined);

      const article = new this.articleModel({
        _id: objectId,
        title: articleData.title,
        slug: articleData.slug,
        description: articleData.description,
        body: articleData.body,
        tagList: articleData.tagList,
        authorId,
        favouritedUserIds,
        createdAt: new Date(articleData.createdAt),
        updatedAt: new Date(articleData.createdAt),
      });

      await article.save();

      // Update articlesLikedIds for users who favorited this article
      for (const userId of favouritedUserIds) {
        await this.userModel.updateOne(
          { _id: userId },
          { $addToSet: { articlesLikedIds: objectId } },
        );
      }
    }

    console.log(`✅ Created ${articles.length} articles`);
  }

  async seedComments(): Promise<void> {
    console.log('💬 Seeding comments...');
    const comments = this.loadJson<SeedComment[]>('comments.json');

    let created = 0;
    for (const commentData of comments) {
      const authorId = this.userIdMap.get(commentData.authorId);
      const articleId = this.articleIdMap.get(commentData.articleId);

      if (!authorId || !articleId) {
        console.warn(`⚠️  Missing reference for comment: ${commentData.id}`);
        continue;
      }

      const comment = new this.commentModel({
        body: commentData.body,
        authorId,
        articleId,
        createdAt: new Date(commentData.createdAt),
        updatedAt: new Date(commentData.createdAt),
      });

      await comment.save();
      created++;
    }

    console.log(`✅ Created ${created} comments`);
  }

  async run(fresh: boolean): Promise<void> {
    console.log('\n🌱 Starting database seed...\n');

    if (fresh) {
      await this.clearDatabase();
    }

    await this.seedUsers();
    await this.seedArticles();
    await this.seedComments();

    console.log('\n✨ Seeding completed successfully!\n');
    this.printSummary();
  }

  private printSummary(): void {
    console.log('📊 Summary:');
    console.log(`   Users: ${this.userIdMap.size}`);
    console.log(`   Articles: ${this.articleIdMap.size}`);
    console.log('   Comments: ~105');
    console.log('\n🔐 All users have password: password123\n');
  }
}

async function bootstrap() {
  const fresh = process.argv.includes('--fresh');

  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn'],
  });

  try {
    const userModel = app.get<Model<User>>('UserModel');
    const articleModel = app.get<Model<Article>>('ArticleModel');
    const commentModel = app.get<Model<Comment>>('CommentModel');

    const seeder = new Seeder(userModel, articleModel, commentModel);
    await seeder.run(fresh);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
