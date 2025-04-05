import axios from 'axios';

interface UnsplashResponse {
  id: string;
  urls: {
    regular: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
  width: number;
  height: number;
}

interface UnsplashSearchResponse {
  results: UnsplashResponse[];
}

export interface UnsplashImage {
  id: string;
  url: string;
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
  width: number;
  height: number;
}

// Access key should be stored in environment variable
const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY || '';

/**
 * Fetches random images from Unsplash API
 * @param query Search query for images
 * @param count Number of images to fetch
 * @returns Array of image objects
 */
export const fetchRandomImages = async (query = '', count = 10): Promise<UnsplashImage[]> => {
  try {
    // If no API key is provided, use placeholder images
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn('No Unsplash API key provided. Using placeholder images.');
      return generatePlaceholderImages(count);
    }

    const endpoint = query 
      ? `https://api.unsplash.com/search/photos?query=${query}&per_page=${count}`
      : `https://api.unsplash.com/photos/random?count=${count}`;
    
    const response = await axios.get<UnsplashSearchResponse | UnsplashResponse[]>(endpoint, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
    
    const results = query 
      ? (response.data as UnsplashSearchResponse).results 
      : (response.data as UnsplashResponse[]);
    
    return results.map((img) => ({
      id: img.id,
      url: img.urls.regular,
      alt_description: img.alt_description || 'Unsplash image',
      user: {
        name: img.user.name,
        username: img.user.username
      },
      width: img.width,
      height: img.height
    }));
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error);
    return generatePlaceholderImages(count);
  }
};

/**
 * Generate placeholder images when API key is missing or API fails
 * @param count Number of placeholder images to generate
 * @returns Array of placeholder image objects
 */
const generatePlaceholderImages = (count: number): UnsplashImage[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `placeholder-${index}`,
    url: `https://placehold.co/800x600/random/text=Image+${index + 1}`,
    alt_description: `Placeholder image ${index + 1}`,
    user: {
      name: 'Placeholder User',
      username: 'placeholder'
    },
    width: 192,
    height: 192
  }));
};

const imageService = { fetchRandomImages };

export default imageService; 