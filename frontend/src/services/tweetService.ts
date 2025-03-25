import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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

// Create axios instance with auth headers
const createAxiosInstance = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_URL}/v1/tweets`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
};

// Get tweets for home feed with pagination
export const getFeed = async (page = 1): Promise<FeedResponse> => {
  try {
    const api = createAxiosInstance();
    const response = await api.get(`/feed/?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tweet feed:', error);
    throw error;
  }
};

// Create a new tweet
export const createTweet = async (tweetData: CreateTweetRequest): Promise<Tweet> => {
  try {
    const api = createAxiosInstance();
    const response = await api.post('/', tweetData);
    return response.data;
  } catch (error) {
    console.error('Error creating tweet:', error);
    throw error;
  }
};

// Get a specific tweet by ID
export const getTweetById = async (id: number): Promise<Tweet> => {
  try {
    const api = createAxiosInstance();
    const response = await api.get(`/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tweet with id ${id}:`, error);
    throw error;
  }
};

// Update a tweet
export const updateTweet = async (id: number, tweetData: CreateTweetRequest): Promise<Tweet> => {
  try {
    const api = createAxiosInstance();
    const response = await api.patch(`/${id}/`, tweetData);
    return response.data;
  } catch (error) {
    console.error(`Error updating tweet with id ${id}:`, error);
    throw error;
  }
};

// Delete a tweet
export const deleteTweet = async (id: number): Promise<void> => {
  try {
    const api = createAxiosInstance();
    await api.delete(`/${id}/`);
  } catch (error) {
    console.error(`Error deleting tweet with id ${id}:`, error);
    throw error;
  }
};

// Like a tweet
export const likeTweet = async (id: number): Promise<void> => {
  try {
    const api = createAxiosInstance();
    await api.post(`/${id}/like/`);
  } catch (error) {
    console.error(`Error liking tweet with id ${id}:`, error);
    throw error;
  }
};

// Retweet a tweet
export const retweetTweet = async (id: number): Promise<void> => {
  try {
    const api = createAxiosInstance();
    await api.post(`/${id}/retweet/`);
  } catch (error) {
    console.error(`Error retweeting tweet with id ${id}:`, error);
    throw error;
  }
};

// Search tweets
export const searchTweets = async (query: string, page = 1): Promise<FeedResponse> => {
  try {
    const api = createAxiosInstance();
    const response = await api.get(`/search/?q=${encodeURIComponent(query)}&page=${page}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching tweets with query "${query}":`, error);
    throw error;
  }
};

// Get tweets from a specific user
export const getUserTweets = async (username: string, page = 1): Promise<FeedResponse> => {
  try {
    const api = createAxiosInstance();
    const response = await api.get(`/user_tweets/?username=${encodeURIComponent(username)}&page=${page}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tweets from user "${username}":`, error);
    throw error;
  }
};

// Upload media attachment for a tweet
export const uploadMedia = async (tweetId: number, file: File): Promise<MediaAttachment> => {
  try {
    const api = createAxiosInstance();
    
    // Need to use FormData to upload files
    const formData = new FormData();
    formData.append('file', file);
    
    // Need to override the content-type header to undefined so axios sets it correctly with boundary
    const response = await api.post(`/${tweetId}/add_media/`, formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error uploading media for tweet ${tweetId}:`, error);
    throw error;
  }
};
