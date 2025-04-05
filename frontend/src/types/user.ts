export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  profile_picture?: string;
  is_verified: boolean;
  is_demo_user: boolean;
  created_at: string;
  followers_count: number;
  following_count: number;
  tweets_count: number;
} 