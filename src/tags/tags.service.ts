import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article } from '../schemas/article.schema';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Article.name) private articleModel: Model<Article>) {}

  async getTags() {
    const articles = await this.articleModel.find().select('tagList').exec();
    const flatTags = articles
      .map((article) => article.tagList)
      .reduce((a, b) => a.concat(b), []);
    const returnTags: string[] = [];
    flatTags.forEach((tag) => {
      if (!(returnTags?.includes(tag) || false)) returnTags.push(tag);
    });
    return returnTags;
  }
}
