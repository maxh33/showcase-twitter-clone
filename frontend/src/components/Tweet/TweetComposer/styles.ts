import styled from 'styled-components';
import { Colors } from '../../../styles/global';

export const TweetComposerWrapper = styled.div`
  padding: 12px 16px;
  border-bottom: 8px solid ${Colors.extraLightGray};
  display: flex;
`;

export const ProfileImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 0;
  min-height: 80px;
  border: none;
  resize: none;
  font-size: 19px;
  font-family: 'Inter', sans-serif;
  color: ${Colors.black};
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${Colors.darkGray};
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

export const ComposerContainer = styled.div`
  padding: 12px 16px;
  border-bottom: 8px solid ${Colors.extraLightGray};
`;

export const ComposerContent = styled.div`
  display: flex;
`;

export const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

export const ComposerForm = styled.div`
  flex: 1;
`;

export const TextInput = styled.textarea`
  width: 100%;
  padding: 10px 0;
  min-height: 80px;
  border: none;
  resize: none;
  font-size: 19px;
  font-family: 'Inter', sans-serif;
  color: ${Colors.black};
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${Colors.darkGray};
  }
`;

export const ErrorMessage = styled.div`
  color: #e0245e;
  padding: 8px 0;
  font-size: 14px;
`;

export const ComposerActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid ${Colors.extraLightGray};
`;

export const IconGroup = styled.div`
  display: flex;
  gap: 12px;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  color: ${Colors.primary};
  font-size: 20px;
  cursor: pointer;
  border-radius: 50%;
  padding: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(29, 161, 242, 0.1);
  }
`;

export const TweetButton = styled.button`
  background-color: ${Colors.primary};
  color: white;
  border: none;
  border-radius: 24px;
  padding: 10px 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1a91da;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const FileInput = styled.input`
  display: none;
`;

export const PreviewContainer = styled.div`
  margin-top: 12px;
  position: relative;
`;

export const ImagePreview = styled.img`
  width: 100%;
  border-radius: 16px;
  max-height: 300px;
  object-fit: cover;
`;

export const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

// Image picker for Unsplash
export const ImagePickerContainer = styled.div`
  border: 1px solid ${Colors.extraLightGray};
  border-radius: 16px;
  margin-top: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

// Image search container (similar to picker but for search results)
export const ImageSearchContainer = styled.div`
  border: 1px solid ${Colors.extraLightGray};
  border-radius: 16px;
  margin-top: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const ImagePickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${Colors.extraLightGray};
  
  h3 {
    margin: 0;
    font-size: 16px;
  }
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${Colors.darkGray};
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${Colors.extraLightGray};
  }
`;

export const SearchForm = styled.form`
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid ${Colors.extraLightGray};
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid ${Colors.extraLightGray};
  border-right: none;
  border-radius: 20px 0 0 20px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${Colors.primary};
  }
`;

export const SearchButton = styled.button`
  background-color: ${Colors.primary};
  color: white;
  border: none;
  border-radius: 0 20px 20px 0;
  padding: 0 15px;
  cursor: pointer;
  
  &:hover {
    background-color: ${Colors.blue};
  }
`;

export const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 16px;
`;

export const ImageGridItem = styled.div`
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  height: 100px;
  position: relative;
  
  &:hover {
    opacity: 0.8;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ImageThumbnail = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
`;

export const LoadingState = styled.div`
  padding: 24px;
  text-align: center;
  color: ${Colors.darkGray};
`;

export const LoadingMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: ${Colors.darkGray};
`;

export const NoResultsMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: ${Colors.darkGray};
`;

export const UnsplashCredit = styled.div`
  font-size: 12px;
  color: ${Colors.darkGray};
  text-align: center;
  padding: 0 16px 16px;
  
  a {
    color: ${Colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Add these styles for the emoji and GIF pickers
export const PickerContainer = styled.div`
  border: 1px solid ${Colors.extraLightGray};
  border-radius: 16px;
  margin-top: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

export const EmojiPickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${Colors.extraLightGray};
  
  h3 {
    margin: 0;
    font-size: 16px;
  }
`;

export const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
`;

export const EmojiButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  padding: 6px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${Colors.extraLightGray};
  }
`;

export const GifPickerContent = styled.div`
  padding: 16px;
  text-align: center;
  
  h3 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 16px;
  }
  
  p {
    color: ${Colors.darkGray};
    font-size: 14px;
  }
`; 