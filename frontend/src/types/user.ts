export interface User {
  id: string | number;
  username: string;
  email: string;
  bio: string | null;
  location: string | null;
  profile_picture: string | null;
  followers_count: number;
  following_count: number;
  tweets_count: number;
  is_verified: boolean;
  is_demo_user: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  last_activation: string | null;
}

export interface FormattedUser {
  id: string;
  username: string;
  profile_picture: string | null;
  email: string;
} 