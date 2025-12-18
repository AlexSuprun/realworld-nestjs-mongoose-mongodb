import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from '../schemas/article.schema';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
  ],
  providers: [TagsService],
  controllers: [TagsController],
})
export class TagsModule {}
