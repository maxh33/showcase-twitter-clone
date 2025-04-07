import React, { useEffect, useState } from 'react';
import tweetService, { Tweet } from '../../services/tweetService';
import Spinner from '../common/Spinner';
import { Box, Button, Typography } from '@mui/material';

const TweetList: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await tweetService.getFeed(page);
        setTweets(prev => page === 1 ? response.results : [...prev, ...response.results]);
        setHasMore(!!response.next);
      } catch (err) {
        console.error('Error fetching tweets:', err);
        setError('Failed to load tweets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTweets();
  }, [page]);

  const loadMoreTweets = () => {
    setPage(prevPage => prevPage + 1);
  };

  if (error && tweets.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {tweets.length === 0 && !isLoading ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography>No tweets yet. Be the first to post!</Typography>
        </Box>
      ) : (
        tweets.map(tweet => (
          <Box key={tweet.id} sx={{ mb: 2 }}>
            {/* Render your tweet component here */}
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                @{tweet.author.username}
              </Typography>
              <Typography variant="body1">{tweet.content}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(tweet.created_at).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        ))
      )}
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <Spinner size={40} />
        </Box>
      )}
      
      {hasMore && !isLoading && tweets.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <Button 
            variant="outlined" 
            onClick={loadMoreTweets}
            sx={{ display: 'block', margin: '0 auto' }}
          >
            Load More
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TweetList; 