import React, { useState, useEffect, useCallback, useRef } from 'react';
import Tweet from '../../Tweet/Tweet';
import TweetComposer from '../../Tweet/TweetComposer/TweetComposer';
import { getFeed, likeTweet, retweetTweet, createComment, Tweet as TweetType } from '../../../services/tweetService';
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

interface FeedProps {
  currentUser?: {
    id: string | number;
    username: string;
    profile_picture: string | null;
  };
}

const Feed: React.FC<FeedProps> = ({ currentUser }) => {
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
    try {
      const response = await getFeed(pageNum);
      
      setTweets(prev => 
        refresh ? response.results : [...prev, ...response.results]
      );
      setHasMore(!!response.next);
      setError(null);
    } catch (err) {
      setError('Failed to load tweets. Please try again later.');
      console.error('Error fetching tweets:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  useEffect(() => {
    fetchTweets(1, true);
  }, [fetchTweets]);
  
  const handleRefresh = async () => {
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
        prev.map(tweet => 
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
        prev.map(tweet => 
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
      const updatedTweet = await createComment(tweetId, content, media);
      
      // Update the tweet in the feed with new comment count
      setTweets(prev => 
        prev.map(tweet => 
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
    handleRefresh();
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
  
  return (
    <IconContext.Provider value={{ className: 'react-icons' }}>
      <S.FeedContainer>
        <S.FeedHeader>
          <S.HeaderTitle>Feed</S.HeaderTitle>
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