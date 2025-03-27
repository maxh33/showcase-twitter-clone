import React, { useState, useEffect, useCallback } from 'react';
import * as S from './styles';
import tweetService from '../../../services/tweetService';
import { formatDistanceToNow } from 'date-fns';

// Types
interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    profile_image: string;
    display_name: string;
  };
  created_at: string;
  updated_at: string;
}

interface CommentsContainerProps {
  tweetId: number;
  isOpen: boolean;
  onClose: () => void;
}

const CommentsContainer: React.FC<CommentsContainerProps> = ({ tweetId, isOpen, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      const data = await tweetService.fetchComments(tweetId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [tweetId, isOpen]);

  // Load comments when component mounts or when isOpen changes
  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, fetchComments]);

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      await tweetService.createComment(tweetId, newComment);
      setNewComment('');
      fetchComments(); // Refresh comments after adding
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <S.Container isOpen={isOpen}>
      <S.Title>Comments</S.Title>
      
      {/* Comment form */}
      <S.CommentForm onSubmit={handleSubmitComment}>
        <S.CommentTextArea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
          disabled={submitting}
        />
        <S.CommentFormActions>
          <S.SubmitButton 
            type="submit" 
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? 'Posting...' : 'Post'}
          </S.SubmitButton>
        </S.CommentFormActions>
      </S.CommentForm>
      
      {/* Comments list */}
      <S.CommentsList>
        {loading ? (
          <S.NoComments>Loading comments...</S.NoComments>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <S.CommentItem key={comment.id}>
              <S.Avatar 
                src={comment.author.profile_image || "/default-avatar.png"} 
                alt={comment.author.username}
              />
              <S.CommentContent>
                <S.CommentHeader>
                  <S.Username>{comment.author.display_name || comment.author.username}</S.Username>
                  <S.DisplayName>@{comment.author.username}</S.DisplayName>
                  <S.Timestamp>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</S.Timestamp>
                </S.CommentHeader>
                <S.CommentText>{comment.content}</S.CommentText>
              </S.CommentContent>
            </S.CommentItem>
          ))
        ) : (
          <S.NoComments>No comments yet. Be the first to comment!</S.NoComments>
        )}
      </S.CommentsList>
    </S.Container>
  );
};

export default CommentsContainer; 