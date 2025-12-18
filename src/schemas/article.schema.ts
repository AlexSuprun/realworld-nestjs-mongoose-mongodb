import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ timestamps: true })
export class Article {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  body: string;

  @Prop({ type: [String], default: [] })
  tagList: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  favouritedUserIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
