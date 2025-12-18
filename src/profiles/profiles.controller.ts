import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserDocument } from '../schemas/user.schema';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtGuard } from 'src/common/guard';
import { ProfilesService } from './profiles.service';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private profileService: ProfilesService) {}
  @Get(':username')
  @ApiOperation({ summary: 'Get profile by username' })
  async findUser(@GetUser() user: UserDocument, @Param('username') userName: string) {
    return { profile: await this.profileService.findUser(user, userName) };
  }

  @HttpCode(HttpStatus.OK)
  @Post(':username/follow')
  @ApiOperation({ summary: 'Follow user' })
  async followUser(@GetUser() user: UserDocument, @Param('username') userName: string) {
    return { profile: await this.profileService.followUser(user, userName) };
  }

  @Delete(':username/follow')
  @ApiOperation({ summary: 'Unfollow user' })
  async unfollowUser(
    @GetUser() user: UserDocument,
    @Param('username') username: string,
  ) {
    return { profile: await this.profileService.unfollowUser(user, username) };
  }
}
