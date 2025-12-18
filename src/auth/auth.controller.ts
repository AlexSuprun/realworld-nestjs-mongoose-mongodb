import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, UserForRegistration } from './dto';

@ApiTags('User and Authentication')
@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async loginUser(@Body('user') dto: LoginDto) {
    const user = await this.authService.verifyUser(dto);
    return { user: user };
  }

  @Post()
  @ApiOperation({ summary: 'Register new user' })
  async registerUser(@Body('user') dto: UserForRegistration) {
    const user = await this.authService.createUser(dto);
    return { user: user };
  }
}
