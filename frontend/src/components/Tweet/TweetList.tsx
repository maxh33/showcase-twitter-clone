import React, { useEffect, useState } from 'react';
import { getTweets } from '../../services/tweets';

const TweetList: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        setIsLoading(true);
        const response = await getTweets(page);
        setTweets(prev => page === 1 ? response.results : [...prev, ...response.results]);
        setHasMore(!!response.next);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching tweets:', error);
        setIsLoading(false);
        
        // On error, check if we're using demo user and load local tweets
        const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('demoUser') || '{}');
        if (user.is_demo_user) {
          const localTweets = JSON.parse(localStorage.getItem('localTweets') || '[]');
          if (localTweets.length > 0) {
            console.log('Loading local tweets for demo user', localTweets);
            setTweets(localTweets);
          }
        }
      }
    };
    
    fetchTweets();
  }, [page]);

  return (
    <div>
      {/* Render your tweets here */}
    </div>
  );
};

export default TweetList; 