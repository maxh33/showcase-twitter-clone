import styled from 'styled-components';
import { Colors } from '../../../styles/global';

export const Container = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-direction: column;
  width: 100%;
  padding: 16px;
  border-top: 1px solid ${Colors.extraLightGray};
  background-color: white;
`;

export const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
  max-height: 400px;
  overflow-y: auto;
`;

export const CommentItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 8px 0;
`;

export const CommentContent = styled.div`
  flex: 1;
`;

export const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const Username = styled.span`
  font-weight: bold;
  color: ${Colors.black};
`;

export const DisplayName = styled.span`
  color: ${Colors.darkGray};
  font-size: 0.9rem;
`;

export const Timestamp = styled.span`
  color: ${Colors.darkGray};
  font-size: 0.8rem;
  margin-left: 8px;
`;

export const CommentText = styled.p`
  margin: 4px 0;
  color: ${Colors.black};
  word-break: break-word;
`;

export const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
`;

export const CommentTextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${Colors.lightGray};
  background-color: rgba(0, 0, 0, 0.03);
  resize: none;
  font-family: inherit;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: ${Colors.primary};
  }
`;

export const SubmitButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${Colors.primary};
  color: white;
  font-weight: bold;
  font-size: 14px;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: ${Colors.blue};
  }
  &:disabled {
    background-color: ${Colors.lightGray};
    cursor: not-allowed;
  }
`;

export const CommentFormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
`;

export const NoComments = styled.div`
  text-align: center;
  padding: 16px;
  color: ${Colors.darkGray};
`;

export const Title = styled.h3`
  margin-top: 0;
  color: ${Colors.black};
  font-size: 18px;
`;

export const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

// Add emoji grid styles similar to TweetComposer
export const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${Colors.extraLightGray};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #bbb;
    border-radius: 4px;
  }
`;

export const EmojiButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${Colors.extraLightGray};
  }
`; 