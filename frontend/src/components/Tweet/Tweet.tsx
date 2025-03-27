import React, { useState } from 'react';
import { Tweet as TweetType } from '../../services/tweetService';
import { formatDistanceToNow } from 'date-fns';
import { FaRegComment, FaRetweet, FaRegHeart, FaHeart, FaShareAlt } from 'react-icons/fa';
import * as S from './styles';
import IconWrapper from '../common/IconWrapper';
import CommentModal from '../Comment/CommentModal/CommentModal';

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
  onReply?: (id: number, content: string, media?: File) => void;
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
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const formattedTime = formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true });
  
  const handleLike = () => {
    onLike(tweet.id);
  };
  
  const handleRetweet = () => {
    onRetweet(tweet.id);
  };
  
  const handleReply = () => {
    setIsCommentModalOpen(true);
  };
  
  const handleShare = () => {
    if (onShare) onShare(tweet.id);
  };

  const handleCommentSubmit = (content: string, media?: File) => {
    if (onReply) {
      onReply(tweet.id, content, media);
    }
    setIsCommentModalOpen(false);
  };
  
  return (
    <>
      <S.TweetContainer>
        <S.Avatar 
          src={tweet.author.profile_picture || 'https://via.placeholder.com/50'} 
          alt={`${tweet.author.username}'s profile picture`} 
        />
        <S.TweetContent>
          <S.TweetHeader>
            <S.UserInfo>
              <S.Username>{tweet.author.username}</S.Username>
              <S.Handle>@{tweet.author.username.toLowerCase().replace(/\s+/g, '')}</S.Handle>
              <S.Timestamp>· {formattedTime}</S.Timestamp>
            </S.UserInfo>
          </S.TweetHeader>
          
          <S.TweetText>{tweet.content}</S.TweetText>
          
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
                <IconWrapper icon={FaRegComment} size={20} />
                {tweet.comments_count > 0 && <span>{tweet.comments_count}</span>}
              </S.ActionButton>
              
              <S.ActionButton onClick={handleRetweet} $active={currentUserRetweeted}>
                <IconWrapper icon={FaRetweet} size={20} color={currentUserRetweeted ? "#17BF63" : undefined} />
                {tweet.retweet_count > 0 && <span>{tweet.retweet_count}</span>}
              </S.ActionButton>
              
              <S.ActionButton onClick={handleLike} $active={currentUserLiked}>
                {currentUserLiked ? 
                  <IconWrapper icon={FaHeart} size={20} color="#E0245E" /> : 
                  <IconWrapper icon={FaRegHeart} size={20} />
                }
                {tweet.likes_count > 0 && <span>{tweet.likes_count}</span>}
              </S.ActionButton>
              
              <S.ActionButton onClick={handleShare}>
                <IconWrapper icon={FaShareAlt} size={20} />
              </S.ActionButton>
            </S.ActionsContainer>
          </S.TweetFooter>
        </S.TweetContent>
      </S.TweetContainer>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onSubmit={handleCommentSubmit}
        replyingTo={tweet}
      />
    </>
  );
};

export default Tweet; 