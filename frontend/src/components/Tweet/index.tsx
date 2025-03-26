import React, { useState } from 'react';
import * as S from './styles';
import { formatDistanceToNow } from 'date-fns';
import { FaRegComment, FaRetweet, FaRegHeart, FaShareAlt } from 'react-icons/fa';
import CommentsContainer from './Comments';
import tweetService from '../../services/tweetService';
import IconWrapper from '../common/IconWrapper';

interface Tweet {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    profile_image: string | null;
    display_name: string | null;
  };
  created_at: string;
  updated_at: string;
  likes_count: number;
  retweet_count: number;
  comments_count: number;
  media?: Array<{
    id: number;
    file: string;
  }>;
}

interface TweetProps {
  tweet: Tweet;
  onTweetUpdated?: (updatedTweet: Tweet) => void;
}

const Tweet: React.FC<TweetProps> = ({ tweet, onTweetUpdated }) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [loading, setLoading] = useState({
    like: false,
    retweet: false,
  });
  const [localTweet, setLocalTweet] = useState<Tweet>(tweet);

  const handleLike = async () => {
    if (loading.like) return;
    
    setLoading((prev) => ({ ...prev, like: true }));
    try {
      const updatedTweet = await tweetService.likeTweet(localTweet.id);
      setLocalTweet(updatedTweet);
      if (onTweetUpdated) {
        onTweetUpdated(updatedTweet);
      }
    } catch (error) {
      console.error('Error liking tweet:', error);
    } finally {
      setLoading((prev) => ({ ...prev, like: false }));
    }
  };

  const handleRetweet = async () => {
    if (loading.retweet) return;
    
    setLoading((prev) => ({ ...prev, retweet: true }));
    try {
      const updatedTweet = await tweetService.retweetTweet(localTweet.id);
      setLocalTweet(updatedTweet);
      if (onTweetUpdated) {
        onTweetUpdated(updatedTweet);
      }
    } catch (error) {
      console.error('Error retweeting:', error);
    } finally {
      setLoading((prev) => ({ ...prev, retweet: false }));
    }
  };

  const toggleComments = () => {
    setIsCommentsOpen(!isCommentsOpen);
  };

  return (
    <>
      <S.TweetContainer>
        <S.Avatar
          src={localTweet.author.profile_image || "/default-avatar.png"}
          alt={localTweet.author.username}
        />
        <div>
          <S.TweetHeader>
            <div>
              <S.Username>
                {localTweet.author.display_name || localTweet.author.username}
              </S.Username>
              <S.Handle>@{localTweet.author.username}</S.Handle>
              <S.Timestamp>
                {formatDistanceToNow(new Date(localTweet.created_at), { addSuffix: true })}
              </S.Timestamp>
            </div>
          </S.TweetHeader>

          <S.TweetContent>
            {localTweet.content}
            {localTweet.media && localTweet.media.length > 0 && (
              <S.MediaContainer>
                <S.MediaImage 
                  src={localTweet.media[0].file} 
                  alt="Tweet media" 
                />
              </S.MediaContainer>
            )}
          </S.TweetContent>

          <S.TweetFooter>
            <S.ActionsContainer>
              <S.ActionButton onClick={toggleComments}>
                <IconWrapper icon={FaRegComment} size={20} />
                {localTweet.comments_count > 0 && localTweet.comments_count}
              </S.ActionButton>
              <S.ActionButton onClick={handleRetweet}>
                <IconWrapper icon={FaRetweet} size={20} />
                {localTweet.retweet_count > 0 && localTweet.retweet_count}
              </S.ActionButton>
              <S.ActionButton onClick={handleLike}>
                <IconWrapper icon={FaRegHeart} size={20} />
                {localTweet.likes_count > 0 && localTweet.likes_count}
              </S.ActionButton>
              <S.ActionButton>
                <IconWrapper icon={FaShareAlt} size={20} />
              </S.ActionButton>
            </S.ActionsContainer>
          </S.TweetFooter>
        </div>
      </S.TweetContainer>
      
      <CommentsContainer 
        tweetId={localTweet.id} 
        isOpen={isCommentsOpen} 
        onClose={() => setIsCommentsOpen(false)} 
      />
    </>
  );
};

export default Tweet; 