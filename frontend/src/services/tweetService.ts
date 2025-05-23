import axios, { AxiosInstance } from 'axios';

// Store the original API URL from environment for debugging
const ORIGINAL_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Try to detect if we're in a deployed environment and use PythonAnywhere API
// The hostname check helps detect when running on Vercel
const isDeployed = typeof window !== 'undefined' && 
                  window.location.hostname !== 'localhost' && 
                  window.location.hostname !== '127.0.0.1';

// If deployed and still using localhost, force to PythonAnywhere
const API_URL = isDeployed && ORIGINAL_API_URL.includes('localhost') 
  ? 'https://maxh33.pythonanywhere.com/api/v1' 
  : ORIGINAL_API_URL;

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
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add a request interceptor to get the latest token before each request
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
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
      console.log(`Fetching tweets page ${page} from ${API_URL}/tweets/`);
      const response = await axiosInstance.get('/tweets/', {
        params: {
          page
        }
      });
      console.log('Feed response:', response.data);
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
  async createTweet(content: string, image?: File | null): Promise<Tweet> {
    try {
      // Check if this is a demo user
      const isDemoUser = localStorage.getItem('isDemoUser') === 'true';
      
      // For demo users in production, simulate a successful tweet creation
      if (isDemoUser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        console.log('Demo user tweet creation (simulated):', content);
        
        // Create a mock tweet that will only exist for this session
        const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
        const mockTweet: Tweet = {
          id: Date.now(),
          content,
          author: demoUser,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likes_count: 0,
          comments_count: 0,
          retweet_count: 0,
          media: image ? [{ 
            id: Date.now(),
            file: URL.createObjectURL(image),
            created_at: new Date().toISOString()
          }] : [],
        };
        
        // Add to local storage for persistence during session
        const localTweets = JSON.parse(localStorage.getItem('demoTweets') || '[]');
        localTweets.unshift(mockTweet);
        localStorage.setItem('demoTweets', JSON.stringify(localTweets.slice(0, 50))); // Keep only 50 latest
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return mockTweet;
      }
      
      // Normal API flow for real users or local development
      const formData = new FormData();
      formData.append('content', content);
      
      if (image) {
        formData.append('image', image);
      }
      
      const response = await createAxiosInstance().post('/tweets/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
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
      const response = await axiosInstance.post(`/tweets/${tweetId}/like/`);
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
      const response = await axiosInstance.post(`/tweets/${tweetId}/retweet/`);
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
      const response = await axiosInstance.get(`/tweets/${tweetId}/comments/`);
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
      
      const response = await axiosInstance.post(`/tweets/${tweetId}/add_comment/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });
      
      console.log('Comment creation response:', response.data);
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
      const response = await axiosInstance.delete(`/tweets/${tweetId}/comments/${commentId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting comment ${commentId} from tweet ${tweetId}:`, error);
      throw error;
    }
  }
};

export const { getFeed, likeTweet, retweetTweet, createTweet, fetchComments, createComment, deleteComment } = tweetService;

export default tweetService;
