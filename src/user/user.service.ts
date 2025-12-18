import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoServerError } from 'mongodb';
import { User, UserDocument } from '../schemas/user.schema';
import { UserForUpdate } from './dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async updateUser(user: UserDocument, dto: UserForUpdate) {
    try {
      const userUpdated = await this.userModel
        .findOneAndUpdate({ email: user.email }, { ...dto }, { new: true })
        .exec();
      return userUpdated;
    } catch (error) {
      if (error instanceof MongoServerError) {
        if (error.code === 11000)
          throw new BadRequestException('email or username taken');
      }
    }
  }
}
