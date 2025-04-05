import { User } from './user';

export interface MediaAttachment {
  id: string;
  url: string;
  type: 'image' | 'video';
  created_at: string;
}

export interface Tweet {
  id: string;
  content: string;
  author: User;
  created_at: string;
  likes_count: number;
  retweet_count: number;
  comments_count: number;
  media_attachments: MediaAttachment[];
  is_liked: boolean;
  is_retweeted: boolean;
  is_bookmarked: boolean;
} 