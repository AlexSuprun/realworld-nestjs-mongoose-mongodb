import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoServerError } from 'mongodb';
import { User } from '../schemas/user.schema';
import { LoginDto, UserDto, UserForRegistration } from './dto';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  async createUser(dto: UserForRegistration) {
    const password = await argon.hash(dto.password);
    try {
      const user = await new this.userModel({
        ...dto,
        password: password,
      }).save();
      const token = await this.signToken(user._id.toString(), user.email);
      const userToReturn: UserDto = {
        email: user.email,
        token: token,
        username: user.username,
        bio: user.bio,
        image: user.image,
      };

      return userToReturn;
    } catch (e) {
      if (e instanceof MongoServerError) {
        if (e.code === 11000) throw new BadRequestException('email is taken');
      }
    }
  }

  async verifyUser(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) throw new NotFoundException('user does not exist');
    const matches = await argon.verify(user.password, dto.password);
    if (!matches)
      throw new UnauthorizedException('password and email do not match');
    const token = await this.signToken(user._id.toString(), user.email);
    const userReturned: UserDto = {
      email: user.email,
      token: token,
      username: user.username,
      bio: user.bio,
      image: user.image,
    };
    return userReturned;
  }

  async signToken(userId: string, email: string): Promise<string> {
    const data = {
      sub: userId,
      email: email,
    };
    const SECRET = this.config.get('SECRET');
    const token = await this.jwt.signAsync(data, {
      secret: SECRET,
      expiresIn: '5h',
    });
    return token;
  }
}
