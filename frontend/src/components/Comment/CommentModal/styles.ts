import styled, { css } from 'styled-components';
import { Colors } from '../../../styles/global';

// Mixin for hiding scrollbars
const hideScrollbar = css`
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: ${Colors.white};
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  ${hideScrollbar}
`;

export const ModalHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${Colors.extraLightGray};
  display: flex;
  justify-content: flex-start;
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: ${Colors.extraLightGray};
    }
  }
`;

export const ModalBody = styled.div`
  padding: 16px;
  display: flex;
  gap: 12px;
`;

export const UserAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`;

export const CommentForm = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: none;
  resize: none;
  font-size: 16px;
  font-family: inherit;
  overflow-y: auto;
  ${hideScrollbar}
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${Colors.darkGray};
  }
`;

export const ImagePreviewContainer = styled.div`
  position: relative;
  margin-top: 12px;
  border-radius: 16px;
  overflow: hidden;
  max-height: 300px;
  width: 100%;
  aspect-ratio: 16/9;
  background-color: ${Colors.extraLightGray};
`;

export const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

export const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.75);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${Colors.white};
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

export const ActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid ${Colors.extraLightGray};
`;

export const MediaActions = styled.div`
  display: flex;
  gap: 16px;
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    color: ${Colors.primary};
    padding: 8px;
    border-radius: 50%;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: ${Colors.extraLightGray};
    }
  }
`;

export const CharacterCount = styled.span<{ warning: boolean }>`
  color: ${({ warning }) => (warning ? Colors.danger : Colors.darkGray)};
  font-size: 14px;
`;

export const SubmitButton = styled.button`
  background-color: ${Colors.primary};
  color: ${Colors.white};
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${Colors.blue};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.p`
  color: ${Colors.danger};
  font-size: 14px;
  margin-top: 8px;
`;

export const ImageSearchContainer = styled.div`
  padding: 16px;
  border-top: 1px solid ${Colors.extraLightGray};
  background-color: ${Colors.white};
`;

export const SearchForm = styled.form`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  width: 100%;
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 8px 16px;
  border: 1px solid ${Colors.extraLightGray};
  border-radius: 9999px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${Colors.primary};
  }
  
  &::placeholder {
    color: ${Colors.darkGray};
  }
`;

export const SearchButton = styled.button`
  background-color: ${Colors.primary};
  color: ${Colors.white};
  border: none;
  border-radius: 9999px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: ${Colors.blue};
  }
`;

export const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 4px;
  ${hideScrollbar}
`;

export const ImageGridItem = styled.div`
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  background-color: ${Colors.extraLightGray};
  transition: transform 0.2s ease;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &:hover {
    transform: scale(1.05);
  }
`;

export const LoadingText = styled.p`
  text-align: center;
  color: ${Colors.darkGray};
  padding: 16px;
  font-size: 14px;
`;

export const EmojiPicker = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  background: ${Colors.white};
  border: 1px solid ${Colors.extraLightGray};
  border-radius: 8px;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
  max-width: 400px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const EmojiButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${Colors.backgroundGray};
  }
`; 