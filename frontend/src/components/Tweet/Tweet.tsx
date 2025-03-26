import React from 'react';
import { Tweet as TweetType } from '../../services/tweetService';
import { formatDistanceToNow } from 'date-fns';
import { IconContext } from 'react-icons';
import * as S from './styles';

// Allow for flexible author ID type (string or number)
interface FlexibleTweet extends Omit<TweetType, 'author'> {
  author: {
    id: string | number;
    username: string;
    profile_picture: string | null;
    email?: string;
    bio?: string | null;
    location?: string | null;
  };
}

interface TweetProps {
  tweet: FlexibleTweet;
  onLike: (id: number) => void;
  onRetweet: (id: number) => void;
  onReply?: (id: number) => void;
  onShare?: (id: number) => void;
  currentUserLiked?: boolean;
  currentUserRetweeted?: boolean;
}

const Tweet: React.FC<TweetProps> = ({
  tweet,
  onLike,
  onRetweet,
  onReply,
  onShare,
  currentUserLiked = false,
  currentUserRetweeted = false
}) => {
  const formattedTime = formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true });
  
  const handleLike = () => {
    onLike(tweet.id);
  };
  
  const handleRetweet = () => {
    onRetweet(tweet.id);
  };
  
  const handleReply = () => {
    if (onReply) onReply(tweet.id);
  };
  
  const handleShare = () => {
    if (onShare) onShare(tweet.id);
  };
  
  return (
    <IconContext.Provider value={{ className: 'react-icons' }}>
      <S.TweetContainer>
        <S.Avatar 
          src={tweet.author.profile_picture || 'https://via.placeholder.com/50'} 
          alt={`${tweet.author.username}'s profile picture`} 
        />
        <div>
          <S.TweetHeader>
            <S.UserInfo>
              <S.Username>{tweet.author.username}</S.Username>
              <S.Handle>@{tweet.author.username.toLowerCase().replace(/\s+/g, '')}</S.Handle>
              <S.Timestamp>· {formattedTime}</S.Timestamp>
            </S.UserInfo>
          </S.TweetHeader>
          
          <S.TweetContent>{tweet.content}</S.TweetContent>
          
          {tweet.media && tweet.media.length > 0 && (
            <S.MediaContainer>
              {tweet.media.map((media) => (
                <S.MediaImage key={media.id} src={media.file} alt="Tweet media" />
              ))}
            </S.MediaContainer>
          )}
          
          <S.TweetFooter>
            <S.ActionsContainer>
              <S.ActionButton onClick={handleReply}>
                💬
                {/* Comment count should be shown here, but we don't have this data yet */}
              </S.ActionButton>
              
              <S.ActionButton onClick={handleRetweet} $active={currentUserRetweeted}>
                {currentUserRetweeted ? <span style={{color: "#17BF63"}}>🔄</span> : "🔄"}
                {tweet.retweet_count > 0 && <span>{tweet.retweet_count}</span>}
              </S.ActionButton>
              
              <S.ActionButton onClick={handleLike} $active={currentUserLiked}>
                {currentUserLiked ? <span style={{color: "#E0245E"}}>❤️</span> : "🤍"}
                {tweet.likes_count > 0 && <span>{tweet.likes_count}</span>}
              </S.ActionButton>
              
              <S.ActionButton onClick={handleShare}>
                📤
              </S.ActionButton>
            </S.ActionsContainer>
          </S.TweetFooter>
        </div>
      </S.TweetContainer>
    </IconContext.Provider>
  );
};

export default Tweet; 