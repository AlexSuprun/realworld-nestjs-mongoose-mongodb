import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserDocument } from '../schemas/user.schema';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { JwtGuard } from 'src/common/guard';
import { UserForUpdate } from './dto';
import { UserService } from './user.service';

@ApiTags('User and Authentication')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  @ApiOperation({ summary: 'Get current user' })
  getCurrentUser(@GetUser() user: UserDocument) {
    return { user: user };
  }

  @Put()
  @ApiOperation({ summary: 'Update current user' })
  async updateUser(@GetUser() user: UserDocument, @Body('user') dto: UserForUpdate) {
    return { user: await this.userService.updateUser(user, dto) };
  }
}
