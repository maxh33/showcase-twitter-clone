import React, { useState, useEffect, useCallback, useRef } from 'react';
import Tweet from '../../Tweet/Tweet';
import TweetComposer from '../../Tweet/TweetComposer/TweetComposer';
import { getFeed, likeTweet, retweetTweet, Tweet as TweetType } from '../../../services/tweetService';
import { fetchRandomUser, RandomUser } from '../../../services/userGeneratorService';
import { IconContext } from 'react-icons';
import * as S from './styles';

// Define a simplified author type to avoid TypeScript errors
interface SimplifiedAuthor {
  id: number | string;
  username: string;
  profile_picture: string | null;
  email?: string;
  bio?: string | null;
  location?: string | null;
}

interface ProcessedTweet extends Omit<TweetType, 'author'> {
  author: SimplifiedAuthor;
}

const Feed: React.FC = () => {
  const [tweets, setTweets] = useState<ProcessedTweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<RandomUser | null>(null);
  
  // Fetch random user for the current user on mount
  useEffect(() => {
    const loadRandomUser = async () => {
      try {
        const user = await fetchRandomUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading random user:', error);
      }
    };
    
    loadRandomUser();
  }, []);
  
  // Ref for infinite scrolling
  const observer = useRef<IntersectionObserver | null>(null);
  const lastTweetRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);
  
  // Initial load and pagination
  useEffect(() => {
    const fetchTweets = async () => {
      try {
        setLoading(true);
        const response = await getFeed(page);
        
        // Process tweets to ensure they have author information
        // If backend does not provide complete author info, fill with random data
        const processedTweets: ProcessedTweet[] = await Promise.all(
          response.results.map(async (tweet: TweetType) => {
            if (!tweet.author || !tweet.author.username) {
              const randomUser = await fetchRandomUser();
              return {
                ...tweet,
                author: {
                  id: randomUser?.id || 'unknown',
                  username: randomUser?.name || 'Unknown User',
                  profile_picture: randomUser?.avatar || 'https://via.placeholder.com/50',
                  email: randomUser?.email || '',
                  bio: null,
                  location: randomUser?.location || null
                }
              };
            }
            return tweet as ProcessedTweet;
          })
        );
        
        if (page === 1) {
          setTweets(processedTweets);
        } else {
          setTweets(prev => [...prev, ...processedTweets]);
        }
        
        setHasMore(!!response.next);
        setError(null);
      } catch (err) {
        setError('Error loading tweets. Please try again.');
        console.error('Error fetching tweets:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    
    fetchTweets();
  }, [page]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
  };
  
  const handleLike = async (id: number) => {
    try {
      await likeTweet(id);
      
      // Update local state optimistically
      setTweets(prevTweets => 
        prevTweets.map(tweet => 
          tweet.id === id 
            ? { ...tweet, likes_count: tweet.likes_count + 1 } 
            : tweet
        )
      );
    } catch (error) {
      console.error('Error liking tweet:', error);
    }
  };
  
  const handleRetweet = async (id: number) => {
    try {
      await retweetTweet(id);
      
      // Update local state optimistically
      setTweets(prevTweets => 
        prevTweets.map(tweet => 
          tweet.id === id 
            ? { ...tweet, retweet_count: tweet.retweet_count + 1 } 
            : tweet
        )
      );
    } catch (error) {
      console.error('Error retweeting tweet:', error);
    }
  };
  
  const renderTweets = () => {
    if (tweets.length === 0 && !loading) {
      return <S.EmptyState>No tweets to show. Create the first one!</S.EmptyState>;
    }
    
    return tweets.map((tweet, index) => {
      if (tweets.length === index + 1) {
        return (
          <div ref={lastTweetRef} key={tweet.id}>
            <Tweet 
              tweet={tweet} 
              onLike={handleLike} 
              onRetweet={handleRetweet} 
            />
          </div>
        );
      } else {
        return (
          <Tweet 
            key={tweet.id} 
            tweet={tweet} 
            onLike={handleLike} 
            onRetweet={handleRetweet} 
          />
        );
      }
    });
  };

  // Replace icon with text spinner
  const renderSpinner = () => (
    <div className="spinner-icon">
      ⟳
    </div>
  );
  
  return (
    <IconContext.Provider value={{ className: 'react-icons' }}>
      <S.FeedContainer>
        <S.FeedHeader>
          <S.HeaderTitle>Home</S.HeaderTitle>
          {refreshing && renderSpinner()}
        </S.FeedHeader>
        
        <TweetComposer 
          onTweetCreated={handleRefresh} 
          userProfilePicture={currentUser?.avatar}
        />
        
        {error && <S.EmptyState>{error}</S.EmptyState>}
        
        {renderTweets()}
        
        {loading && <S.LoadingSpinner>{renderSpinner()}</S.LoadingSpinner>}
        
        {!loading && hasMore && (
          <S.LoadMoreButton onClick={handleRefresh}>
            Load more
          </S.LoadMoreButton>
        )}
      </S.FeedContainer>
    </IconContext.Provider>
  );
};

export default Feed; 