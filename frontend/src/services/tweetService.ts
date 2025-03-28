import axios, { AxiosInstance } from 'axios';
import { API_URL } from '../utils/apiConfig';

// Define interfaces for tweets
export interface Tweet {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    email: string;
    profile_picture: string | null;
    bio: string | null;
    location: string | null;
  };
  created_at: string;
  updated_at: string;
  likes_count: number;
  retweet_count: number;
  comments_count: number;
  media: MediaAttachment[];
}

export interface MediaAttachment {
  id: number;
  file: string;
  created_at: string;
}

export interface CreateTweetRequest {
  content: string;
}

export interface FeedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Tweet[];
}

/**
 * Creates a configured axios instance for tweet-related API calls
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${API_URL}/v1/tweets`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add a request interceptor to get the latest token before each request
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Service for tweet-related operations
 */
export const tweetService = {
  /**
   * Fetches tweets from the API
   */
  async getFeed(page = 1): Promise<FeedResponse> {
    const axiosInstance = createAxiosInstance();
    try {
      const response = await axiosInstance.get('/', {
        params: {
          page
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching tweets:', error);
      throw error;
    }
  },

  /**
   * Creates a new tweet
   * @param content - The content of the tweet
   */
  async createTweet(content: string, media?: File) {
    const axiosInstance = createAxiosInstance();
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      if (media) {
        formData.append('media', media);
      }
      
      const response = await axiosInstance.post('/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Tweet created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating tweet:', error);
      throw error;
    }
  },

  /**
   * Likes a tweet
   * @param tweetId - The ID of the tweet to like
   */
  async likeTweet(tweetId: number) {
    const axiosInstance = createAxiosInstance();
    try {
      const response = await axiosInstance.post(`/${tweetId}/like/`);
      return response.data;
    } catch (error) {
      console.error(`Error liking tweet ${tweetId}:`, error);
      throw error;
    }
  },

  /**
   * Retweets a tweet
   * @param tweetId - The ID of the tweet to retweet
   */
  async retweetTweet(tweetId: number) {
    const axiosInstance = createAxiosInstance();
    try {
      const response = await axiosInstance.post(`/${tweetId}/retweet/`);
      return response.data;
    } catch (error) {
      console.error(`Error retweeting tweet ${tweetId}:`, error);
      throw error;
    }
  },
  
  /**
   * Fetches comments for a tweet
   * @param tweetId - The ID of the tweet to get comments for
   */
  async fetchComments(tweetId: number) {
    const axiosInstance = createAxiosInstance();
    try {
      const response = await axiosInstance.get(`/${tweetId}/comments/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for tweet ${tweetId}:`, error);
      throw error;
    }
  },
  
  /**
   * Creates a new comment on a tweet
   * @param tweetId - The ID of the tweet to comment on
   * @param content - The content of the comment
   * @param media - Optional media file to attach to the comment
   */
  async createComment(tweetId: number, content: string, media?: File) {
    const axiosInstance = createAxiosInstance();
    try {
      const formData = new FormData();
      formData.append('content', content);
      
      if (media) {
        formData.append('media', media);
      }
      
      const response = await axiosInstance.post(`/${tweetId}/comments/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: axiosInstance.defaults.headers.Authorization,
        },
      });
      
      console.log('Comment created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error creating comment on tweet ${tweetId}:`, error);
      throw error;
    }
  },
  
  /**
   * Deletes a comment
   * @param tweetId - The ID of the tweet the comment belongs to
   * @param commentId - The ID of the comment to delete
   */
  async deleteComment(tweetId: number, commentId: number) {
    const axiosInstance = createAxiosInstance();
    try {
      const response = await axiosInstance.delete(`/${tweetId}/comments/${commentId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting comment ${commentId} from tweet ${tweetId}:`, error);
      throw error;
    }
  }
};

export const { getFeed, likeTweet, retweetTweet, createTweet, fetchComments, createComment, deleteComment } = tweetService;

export default tweetService;
