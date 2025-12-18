import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  bio: string;

  @Prop()
  image: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  followersIds: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  followingIds: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Article' }], default: [] })
  articlesLikedIds: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
