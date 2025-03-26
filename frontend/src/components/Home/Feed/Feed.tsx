import React, { useState, useEffect, useCallback, useRef } from 'react';
import Tweet from '../../Tweet/Tweet';
import TweetComposer from '../../Tweet/TweetComposer/TweetComposer';
import { getFeed, likeTweet, retweetTweet, Tweet as TweetType } from '../../../services/tweetService';
import { fetchRandomUser, RandomUser } from '../../../services/userGeneratorService';
import { IconContext } from 'react-icons';
import * as S from './styles';

// Define a simplified author type to avoid TypeScript errors
interface SimplifiedAuthor {
  id: number;
  username: string;
  email: string;
  profile_picture: string | null;
  bio: string | null;
  location: string | null;
}

interface ProcessedTweet extends TweetType {
  author: SimplifiedAuthor;
}

interface FeedProps {
  currentUser?: {
    id: string | number;
    username: string;
    profile_picture?: string | null;
    email?: string;
  };
}

const Feed: React.FC<FeedProps> = ({ currentUser }) => {
  const [tweets, setTweets] = useState<ProcessedTweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Add state to track liked and retweeted tweets
  const [likedTweets, setLikedTweets] = useState<number[]>([]);
  const [retweetedTweets, setRetweetedTweets] = useState<number[]>([]);
  
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
        const processedTweets: ProcessedTweet[] = response.results.map((tweet: TweetType) => {
          // If the tweet has a valid author, use it as is
          if (tweet.author && tweet.author.username) {
            return {
              ...tweet,
              author: {
                ...tweet.author,
                profile_picture: tweet.author.profile_picture || 'https://via.placeholder.com/50'
              }
            };
          }
          
          // If no author, use current user's data or fallback
          return {
            ...tweet,
            author: {
              id: Number(currentUser?.id) || 0,
              username: currentUser?.username || 'Unknown User',
              email: currentUser?.email || 'unknown@example.com',
              profile_picture: currentUser?.profile_picture || 'https://via.placeholder.com/50',
              bio: null,
              location: null
            }
          };
        });
        
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
  }, [page, currentUser]);
  
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    
    // Reset to page 1 to fetch the latest tweets
    setPage(1);
    
    // If the refresh is triggered by a new tweet being posted,
    // we don't need to show the loading state because the new tweet
    // will be fetched and displayed at the top of the feed
    setLoading(false);
  }, []);
  
  // Called when a new tweet is successfully created
  const onTweetCreated = useCallback(async () => {
    try {
      // Fetch just the latest tweets (page 1)
      const response = await getFeed(1);
      
      // Process tweets to ensure they have author information
      const processedTweets: ProcessedTweet[] = response.results.map((tweet: TweetType) => {
        // If the tweet has a valid author, use it as is
        if (tweet.author && tweet.author.username) {
          return {
            ...tweet,
            author: {
              ...tweet.author,
              profile_picture: tweet.author.profile_picture || 'https://via.placeholder.com/50'
            }
          };
        }
        
        // If no author, use current user's data or fallback
        return {
          ...tweet,
          author: {
            id: Number(currentUser?.id) || 0,
            username: currentUser?.username || 'Unknown User',
            email: currentUser?.email || 'unknown@example.com',
            profile_picture: currentUser?.profile_picture || 'https://via.placeholder.com/50',
            bio: null,
            location: null
          }
        };
      });
      
      // Update tweet list with the newest tweets at the top
      setTweets(prevTweets => {
        // Get existing tweet IDs for comparison
        const existingIds = new Set(prevTweets.map(t => t.id));
        
        // Filter out only the new tweets
        const newTweets = processedTweets.filter(t => !existingIds.has(t.id));
        
        // Combine new tweets at the top with existing tweets
        return [...newTweets, ...prevTweets];
      });
      
    } catch (error) {
      console.error('Error fetching new tweets:', error);
    } finally {
      setRefreshing(false);
    }
  }, [currentUser]);
  
  const handleLike = async (id: number) => {
    try {
      // Check if tweet is already liked
      if (likedTweets.includes(id)) {
        return; // Already liked, do nothing
      }
      
      await likeTweet(id);
      
      // Add to liked tweets set
      setLikedTweets(prev => [...prev, id]);
      
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
      // Check if tweet is already retweeted
      if (retweetedTweets.includes(id)) {
        return; // Already retweeted, do nothing
      }
      
      await retweetTweet(id);
      
      // Add to retweeted tweets set
      setRetweetedTweets(prev => [...prev, id]);
      
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
              currentUserLiked={likedTweets.includes(tweet.id)}
              currentUserRetweeted={retweetedTweets.includes(tweet.id)}
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
            currentUserLiked={likedTweets.includes(tweet.id)}
            currentUserRetweeted={retweetedTweets.includes(tweet.id)}
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
          onTweetCreated={onTweetCreated} 
          userProfilePicture={currentUser?.profile_picture || 'https://via.placeholder.com/50'}
        />
        
        {error && <S.EmptyState>{error}</S.EmptyState>}
        
        {renderTweets()}
        
        {loading && <S.LoadingSpinner>{renderSpinner()}</S.LoadingSpinner>}
        
        {!loading && hasMore && (
          <S.LoadMoreButton onClick={() => handleRefresh()}>
            Load more
          </S.LoadMoreButton>
        )}
      </S.FeedContainer>
    </IconContext.Provider>
  );
};

export default Feed; 