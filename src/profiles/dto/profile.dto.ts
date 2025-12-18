import { UserDocument } from '../../schemas/user.schema';

export interface ProfileDto {
  username: string;
  bio: string;
  image: string;
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
