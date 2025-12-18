import { ApiProperty } from '@nestjs/swagger';
import { UserDocument } from '../../schemas/user.schema';

export class ProfileDto {
  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'I work at statefarm' })
  bio: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  image: string;

  @ApiProperty({ example: false })
  following: boolean;
}

export function castToProfile(user: UserDocument, isFollowing: boolean): ProfileDto {
  return {
    username: user.username,
    bio: user.bio,
    image: user.image,
    following: isFollowing,
  };
}
