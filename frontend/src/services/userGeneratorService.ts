import axios from 'axios';

export interface RandomUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  email: string;
  location?: string;
}

interface RandomUserAPIResponse {
  login: {
    uuid: string;
    username: string;
  };
  name: {
    first: string;
    last: string;
  };
  picture: {
    medium: string;
  };
  email: string;
  location: {
    city: string;
    country: string;
  };
}

/**
 * Fetches random users from randomuser.me API
 * @param count Number of users to fetch
 * @returns Array of random users
 */
export const fetchRandomUsers = async (count = 5): Promise<RandomUser[]> => {
  try {
    const response = await axios.get<{ results: RandomUserAPIResponse[] }>(`https://randomuser.me/api/?results=${count}`);
    
    return response.data.results.map((user: RandomUserAPIResponse) => ({
      id: user.login.uuid,
      name: `${user.name.first} ${user.name.last}`,
      handle: user.login.username,
      avatar: user.picture.medium,
      email: user.email,
      location: `${user.location.city}, ${user.location.country}`
    }));
  } catch (error) {
    console.error('Error fetching random users:', error);
    return [];
  }
};

/**
 * Fetches a single random user from randomuser.me API
 * @returns A random user or null if there was an error
 */
export const fetchRandomUser = async (): Promise<RandomUser | null> => {
  try {
    const users = await fetchRandomUsers(1);
    return users[0] || null;
  } catch (error) {
    console.error('Error fetching random user:', error);
    return null;
  }
};

const userGeneratorService = { fetchRandomUsers, fetchRandomUser };

export default userGeneratorService; 