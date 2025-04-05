import React, { useState, useEffect, useCallback, useRef } from 'react';
import Tweet from '../../Tweet/Tweet';
import TweetComposer from '../../Tweet/TweetComposer/TweetComposer';
import { getFeed, likeTweet, retweetTweet, createComment, Tweet as TweetType } from '../../../services/tweetService';
import { IconContext } from 'react-icons';
import * as S from './styles';
import { refreshToken, setupAuthHeaders } from '../../../services/authService';

interface FeedProps {
  currentUser?: {
    id: string | number;
    username: string;
    profile_picture: string | null;
  };
}

const Feed: React.FC<FeedProps> = ({ currentUser }) => {
  // Initialize tweets as an empty array to prevent undefined errors
  const [tweets, setTweets] = useState<TweetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [likedTweets, setLikedTweets] = useState<number[]>([]);
  const [retweetedTweets, setRetweetedTweets] = useState<number[]>([]);
  
  const lastTweetRef = useRef<HTMLDivElement>(null);
  
  const fetchTweets = useCallback(async (pageNum = 1, refresh = false) => {
    console.log('Feed component: Fetching tweets, page:', pageNum, 'refresh:', refresh);
    try {
      // Ensure auth headers are setup
      setupAuthHeaders();
      
      const response = await getFeed(pageNum);
      console.log('Feed component: Got tweets response:', response);
      
      // Check if response is an array (direct tweets) or an object with results property
      const results = Array.isArray(response) ? response : (response?.results || []);
      
      setTweets(prev => 
        refresh ? [...results] : [...(prev || []), ...results]
      );
      
      // Update hasMore based on whether there's a next property or if we have more items than requested
      setHasMore(response && typeof response === 'object' && 'next' in response ? !!response.next : results.length > 0);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching tweets:', err);
      
      // Check if it's an authentication error
      if (err && typeof err === 'object' && 'response' in err && 
          err.response && typeof err.response === 'object' && 
          'status' in err.response && err.response.status === 401) {
        try {
          // Try to refresh the token
          await refreshToken();
          // Try the original request again
          const response = await getFeed(pageNum);
          const results = Array.isArray(response) ? response : (response?.results || []);
          setTweets(prev => 
            refresh ? [...results] : [...(prev || []), ...results]
          );
          setHasMore(response && typeof response === 'object' && 'next' in response ? !!response.next : results.length > 0);
          setError(null);
          return;
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          setError('Your session has expired. Please log in again.');
        }
      } else {
        setError('Failed to load tweets. Please try again later.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  useEffect(() => {
    console.log('Feed component: Initial load of tweets');
    
    const loadTweets = async () => {
      try {
        await fetchTweets(1, true);
      } catch (error) {
        console.error('Error in initial tweet load:', error);
      }
    };
    
    // Only fetch if the component is mounted
    if (currentUser) {
      loadTweets();
    }
    
    // Cleanup function to prevent updates after unmount
    return () => {
      // No need to set isMounted to false since removed it
    };
  }, [fetchTweets, currentUser]);
  
  const handleRefresh = async () => {
    console.log('Feed component: Manual refresh triggered');
    setRefreshing(true);
    await fetchTweets(1, true);
  };
  
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchTweets(page + 1);
    }
  };
  
  const handleLike = async (tweetId: number) => {
    try {
      const updatedTweet = await likeTweet(tweetId);
      
      setTweets(prev => 
        (prev || []).map(tweet => 
          tweet.id === tweetId ? updatedTweet : tweet
        )
      );
      
      // Toggle liked state
      setLikedTweets(prev => 
        prev.includes(tweetId)
          ? prev.filter(id => id !== tweetId)
          : [...prev, tweetId]
      );
    } catch (error) {
      console.error('Error liking tweet:', error);
    }
  };
  
  const handleRetweet = async (tweetId: number) => {
    try {
      const updatedTweet = await retweetTweet(tweetId);
      
      setTweets(prev => 
        (prev || []).map(tweet => 
          tweet.id === tweetId ? updatedTweet : tweet
        )
      );
      
      // Toggle retweeted state
      setRetweetedTweets(prev => 
        prev.includes(tweetId)
          ? prev.filter(id => id !== tweetId)
          : [...prev, tweetId]
      );
    } catch (error) {
      console.error('Error retweeting:', error);
    }
  };

  const handleReply = async (tweetId: number, content: string, media?: File) => {
    try {
      await createComment(tweetId, content, media);
      
      // Update the tweet in the feed with new comment count
      setTweets(prev => 
        (prev || []).map(tweet => 
          tweet.id === tweetId 
            ? { ...tweet, comments_count: tweet.comments_count + 1 }
            : tweet
        )
      );
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error; // Re-throw to let the CommentModal handle the error
    }
  };
  
  const onTweetCreated = () => {
    console.log('Feed component: Tweet created callback triggered');
    handleRefresh();
  };
  
  const renderTweets = () => {
    // Ensure tweets is always an array
    const tweetArray = tweets || [];
    console.log('Feed component: Rendering tweets, count:', tweetArray.length);
    
    // Check if tweets is empty
    if (tweetArray.length === 0) {
      if (!loading) {
        return <S.EmptyState>No tweets to show. Create the first one!</S.EmptyState>;
      }
      return null;
    }
    
    return tweetArray.map((tweet, index) => {
      if (tweetArray.length === index + 1) {
        return (
          <div ref={lastTweetRef} key={tweet.id}>
            <Tweet 
              tweet={tweet} 
              onLike={handleLike} 
              onRetweet={handleRetweet}
              onReply={handleReply}
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
            onReply={handleReply}
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
  
  console.log('Feed component state:', { 
    tweetsCount: tweets?.length || 0, 
    loading, 
    error, 
    hasMore, 
    page, 
    refreshing 
  });
  
  return (
    <IconContext.Provider value={{ className: 'react-icons' }}>
      <S.FeedContainer>
        <S.FeedHeader>
          <S.HeaderTitle>Feed</S.HeaderTitle>
          {refreshing && renderSpinner()}
        </S.FeedHeader>
        
        <TweetComposer 
          onTweetCreated={onTweetCreated} 
          userProfilePicture={currentUser?.profile_picture || '/logo192.png'}
        />
        
        {error && <S.EmptyState>{error}</S.EmptyState>}
        
        {renderTweets()}
        
        {loading && <S.LoadingSpinner>{renderSpinner()}</S.LoadingSpinner>}
        
        {!loading && hasMore && (
          <S.LoadMoreButton onClick={() => loadMore()}>
            Load more
          </S.LoadMoreButton>
        )}
      </S.FeedContainer>
    </IconContext.Provider>
  );
};

export default Feed; 