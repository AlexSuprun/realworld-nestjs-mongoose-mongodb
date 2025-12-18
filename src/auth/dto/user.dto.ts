import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}

export class UserDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'I work at statefarm' })
  bio: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  image?: string;
}

export class UserForRegistration {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;
}

export class UserForUpdate {
  @ApiPropertyOptional({ example: 'newemail@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'newusername' })
  username?: string;

  @ApiPropertyOptional({ example: 'Updated bio' })
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/new-avatar.jpg' })
  image?: string;
}
