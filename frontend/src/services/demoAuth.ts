import { User } from '../types/user';

export const createDemoUser = async (): Promise<User> => {
  // Generate a random username with timestamp to avoid conflicts
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 12);
  const randomStr = Math.random().toString(36).substring(2, 8);
  const username = `demo_user_${timestamp}_${randomStr}`;

  const demoUser: User = {
    id: `demo_${timestamp}`,
    username,
    email: `${username}@demo.com`,
    bio: 'This is a demo account',
    location: 'Demo Land',
    profile_picture: '/logo192.png',
    is_verified: false,
    is_demo_user: true,
    created_at: new Date().toISOString(),
    followers_count: 0,
    following_count: 0,
    tweets_count: 0
  };

  // Store demo user info in localStorage
  localStorage.setItem('demo_user', JSON.stringify(demoUser));
  localStorage.setItem('is_demo_user', 'true');

  return demoUser;
};

export const getDemoUser = (): User | null => {
  const demoUserStr = localStorage.getItem('demo_user');
  return demoUserStr ? JSON.parse(demoUserStr) : null;
};

export const clearDemoUser = (): void => {
  localStorage.removeItem('demo_user');
  localStorage.removeItem('is_demo_user');
};

const demoAuth = {
  createDemoUser,
  getDemoUser,
  clearDemoUser
};

export default demoAuth; 