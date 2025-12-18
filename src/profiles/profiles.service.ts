import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { castToProfile, ProfileDto } from './dto';

@Injectable()
export class ProfilesService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findUser(user: UserDocument, userName: string) {
    const userFromDb = await this.userModel
      .findOne({ username: userName })
      .exec();
    if (!userFromDb) throw new NotFoundException('user not found');

    const isFollowing = userFromDb.followersIds.some(
      (id) => id.toString() === user._id.toString(),
    );
    const profile: ProfileDto = castToProfile(userFromDb, isFollowing);
    return profile;
  }

  async followUser(user: UserDocument, userName: string) {
    const userFollowed = await this.userModel
      .findOneAndUpdate(
        { username: userName },
        { $addToSet: { followersIds: user._id } },
        { new: true },
      )
      .exec();

    if (!userFollowed) throw new NotFoundException('user not found');

    const profile: ProfileDto = castToProfile(userFollowed, true);
    return profile;
  }

  async unfollowUser(user: UserDocument, username: string) {
    const userFromDb = await this.userModel
      .findOneAndUpdate(
        { username: username },
        { $pull: { followersIds: user._id } },
        { new: true },
      )
      .exec();

    if (!userFromDb) throw new NotFoundException('user not found');

    const profile: ProfileDto = castToProfile(userFromDb, false);
    return profile;
  }
}
