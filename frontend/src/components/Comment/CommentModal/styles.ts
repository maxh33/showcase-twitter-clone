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

export const ModalContainer = styled.div`
  background: ${Colors.white};
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

export const ModalHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${Colors.extraLightGray};
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export const ModalContent = styled.div`
  padding: 16px;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${Colors.extraLightGray};
  }
`;

export const ReplyingToSection = styled.div`
  display: flex;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${Colors.extraLightGray};
`;

export const ReplyingToAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
`;

export const ReplyingToInfo = styled.div`
  flex: 1;
`;

export const ReplyingToName = styled.div`
  font-weight: bold;
`;

export const ReplyingToUsername = styled.div`
  color: ${Colors.darkGray};
  font-size: 14px;
  margin-bottom: 4px;
`;

export const ReplyingToContent = styled.p`
  margin-top: 4px;
  color: ${Colors.darkGray};
  font-size: 14px;
`;

export const ReplyingToMedia = styled.div`
  margin-top: 8px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${Colors.extraLightGray};
`;

export const ComposerSection = styled.div`
  display: flex;
  margin-bottom: 16px;
`;

export const ComposerAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
`;

export const ComposerInputContainer = styled.div`
  flex: 1;
  position: relative;
`;

export const ComposerTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: none;
  resize: none;
  font-size: 16px;
  font-family: inherit;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${Colors.darkGray};
  }
`;

export const PreviewContainer = styled.div`
  position: relative;
  margin-top: 12px;
  border-radius: 16px;
  overflow: hidden;
  max-height: 300px;
`;

export const ImagePreview = styled.img`
  width: 100%;
  object-fit: cover;
`;

export const RemoveButton = styled.button`
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
`;

export const ErrorMessage = styled.div`
  color: ${Colors.danger};
  margin-top: 8px;
  font-size: 14px;
`;

export const ImageSearchContainer = styled.div`
  margin-top: 16px;
  border: 1px solid ${Colors.extraLightGray};
  border-radius: 8px;
  overflow: hidden;
`;

export const ImagePickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid ${Colors.extraLightGray};
`;

export const SearchForm = styled.form`
  display: flex;
  padding: 12px;
  gap: 8px;
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid ${Colors.extraLightGray};
  border-radius: 4px;
`;

export const SearchButton = styled.button`
  background: ${Colors.primary};
  color: ${Colors.white};
  border: none;
  border-radius: 4px;
  padding: 0 16px;
  cursor: pointer;
  
  &:hover {
    background: ${Colors.blue};
  }
`;

export const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
  ${hideScrollbar}
`;

export const ImageGridItem = styled.div`
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const LoadingMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: ${Colors.darkGray};
`;

export const EmojiPickerContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  background: ${Colors.white};
  border: 1px solid ${Colors.extraLightGray};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

export const EmojiPickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid ${Colors.extraLightGray};
`;

export const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
  ${hideScrollbar}
`;

export const EmojiButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    background: ${Colors.extraLightGray};
  }
`;

export const ComposerActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid ${Colors.extraLightGray};
`;

export const IconGroup = styled.div`
  display: flex;
  gap: 16px;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  color: ${Colors.primary};
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  
  &:hover {
    background: rgba(29, 161, 242, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ReplyButton = styled.button`
  background: ${Colors.primary};
  color: ${Colors.white};
  border: none;
  border-radius: 9999px;
  padding: 8px 16px;
  font-weight: bold;
  cursor: pointer;
  
  &:hover {
    background: ${Colors.blue};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`; 