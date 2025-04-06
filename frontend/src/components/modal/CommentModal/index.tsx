import React, { useState, useRef, useEffect } from 'react';
import { EMOJI_LIST } from '../../common/constants';
import { fetchRandomImages, UnsplashImage } from '../../../services/imageService';
import { Tweet } from '../../../services/tweetService';
import * as S from './styles';

// Custom hook to handle outside clicks
const useOutsideClickHandler = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

// Allow for flexible author ID type (string or number)
interface FlexibleTweet extends Omit<Tweet, 'author'> {
  author: {
    id: string | number;
    username: string;
    profile_picture: string | null;
    email?: string;
    bio?: string | null;
    location?: string | null;
  };
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, media?: File) => void;
  replyingTo?: FlexibleTweet;
  userProfilePicture?: string;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  replyingTo,
  userProfilePicture = '/logo192.png'
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Use the custom hook for modal outside click
  useOutsideClickHandler(modalRef, onClose);
  
  // Use the custom hook for emoji picker outside click
  useOutsideClickHandler(emojiPickerRef, () => setShowEmojiPicker(false));
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (errorMessage) setErrorMessage(null);
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  // Extract file reading logic to a separate function
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Process file selection
  const processFileSelection = async (file: File) => {
    setSelectedFile(file);
    const dataUrl = await readFileAsDataURL(file);
    setPreviewUrl(dataUrl);
    
    // Close other pickers when a file is selected
    setShowImageSearch(false);
    setShowEmojiPicker(false);
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFileSelection(file);
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const toggleImageSearch = async () => {
    setShowEmojiPicker(false);
    
    const newState = !showImageSearch;
    setShowImageSearch(newState);
    
    if (newState && unsplashImages.length === 0) {
      await fetchImages();
    }
  };
  
  const fetchImages = async (query = '') => {
    setIsLoadingImages(true);
    try {
      const images = await fetchRandomImages(query || undefined);
      setUnsplashImages(images);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };
  
  const handleImageSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageSearchQuery.trim()) {
      fetchImages(imageSearchQuery);
    }
  };
  
  const handleUnsplashImageSelect = (image: UnsplashImage) => {
    setPreviewUrl(image.url);
    setShowImageSearch(false);
  };
  
  const toggleEmojiPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowImageSearch(false);
    setShowEmojiPicker(!showEmojiPicker);
  };
  
  const handleEmojiSelect = (emoji: string) => {
    const cursorPosition = textInputRef.current?.selectionStart || content.length;
    const newContent = 
      content.substring(0, cursorPosition) + 
      emoji + 
      content.substring(cursorPosition);
    
    setContent(newContent);
    setShowEmojiPicker(false);
    
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        const newCursorPosition = cursorPosition + emoji.length;
        textInputRef.current.selectionStart = newCursorPosition;
        textInputRef.current.selectionEnd = newCursorPosition;
      }
    }, 0);
  };
  
  const handleSubmit = async () => {
    if (content.trim() === '' && !selectedFile && !previewUrl) {
      setErrorMessage('Please enter some content or add an image before commenting.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      onSubmit(content, selectedFile || undefined);
      
      // Reset form
      setContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowImageSearch(false);
      setShowEmojiPicker(false);
      onClose();
    } catch (error) {
      console.error('Error creating comment:', error);
      setErrorMessage('Failed to create comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <S.ModalOverlay isOpen={isOpen}>
      <S.ModalContainer ref={modalRef}>
        <S.ModalHeader>
          <S.CloseButton onClick={onClose}>
            ✕
          </S.CloseButton>
        </S.ModalHeader>
        
        <S.ModalContent>
          {replyingTo && (
            <S.ReplyingToSection>
              <S.ReplyingToAvatar 
                src={replyingTo.author.profile_picture || '/logo192.png'} 
                alt={`${replyingTo.author.username}'s profile picture`} 
              />
              
              <S.ReplyingToInfo>
                <S.ReplyingToName>{replyingTo.author.username}</S.ReplyingToName>
                <S.ReplyingToUsername>@{replyingTo.author.username?.toLowerCase().replace(/\s+/g, '')}</S.ReplyingToUsername>
                <S.ReplyingToContent>{replyingTo.content}</S.ReplyingToContent>
                {replyingTo.media && replyingTo.media.length > 0 && (
                  <S.ReplyingToMedia>
                    <img 
                      src={replyingTo.media[0].file} 
                      alt="Tweet media" 
                      style={{ 
                        width: '100%',
                        maxHeight: '200px',
                        objectFit: 'cover',
                        borderRadius: '16px',
                        marginTop: '8px'
                      }}
                    />
                  </S.ReplyingToMedia>
                )}
              </S.ReplyingToInfo>
            </S.ReplyingToSection>
          )}
          
          <S.ComposerSection>
            <S.ComposerAvatar src={userProfilePicture} alt="Your profile" />
            
            <S.ComposerInputContainer>
              <S.ComposerTextarea 
                placeholder="Tweet your reply"
                value={content}
                onChange={handleContentChange}
                maxLength={280}
                ref={textInputRef}
                disabled={isSubmitting}
              />
              
              {previewUrl && (
                <S.PreviewContainer>
                  <S.ImagePreview src={previewUrl} alt="Selected media" />
                  <S.RemoveButton onClick={handleRemoveFile} disabled={isSubmitting}>
                    ✕
                  </S.RemoveButton>
                </S.PreviewContainer>
              )}
              
              {errorMessage && (
                <S.ErrorMessage>{errorMessage}</S.ErrorMessage>
              )}
              
              {showImageSearch && (
                <S.ImageSearchContainer>
                  <S.ImagePickerHeader>
                    <h3>Search for images</h3>
                    <S.CloseButton onClick={() => setShowImageSearch(false)}>
                      ✕
                    </S.CloseButton>
                  </S.ImagePickerHeader>
                  
                  <S.SearchForm onSubmit={handleImageSearchSubmit}>
                    <S.SearchInput 
                      type="text"
                      placeholder="Search for images..."
                      value={imageSearchQuery}
                      onChange={(e) => setImageSearchQuery(e.target.value)}
                    />
                    <S.SearchButton type="submit">
                      Search
                    </S.SearchButton>
                  </S.SearchForm>
                  
                  <S.ImageGrid>
                    {isLoadingImages ? (
                      <S.LoadingMessage>Loading images...</S.LoadingMessage>
                    ) : (
                      unsplashImages.map((image, index) => (
                        <S.ImageGridItem 
                          key={index} 
                          onClick={() => handleUnsplashImageSelect(image)}
                        >
                          <img src={image.url} alt={image.alt_description || 'Unsplash image'} />
                        </S.ImageGridItem>
                      ))
                    )}
                  </S.ImageGrid>
                </S.ImageSearchContainer>
              )}
              
              {showEmojiPicker && (
                <div ref={emojiPickerRef}>
                  <S.EmojiPickerContainer>
                    <S.EmojiPickerHeader>
                      <h3>Choose an emoji</h3>
                      <S.CloseButton onClick={() => setShowEmojiPicker(false)}>
                        ✕
                      </S.CloseButton>
                    </S.EmojiPickerHeader>
                    
                    <S.EmojiGrid>
                      {EMOJI_LIST.map((emoji, index) => (
                        <S.EmojiButton key={index} onClick={() => handleEmojiSelect(emoji)}>
                          {emoji}
                        </S.EmojiButton>
                      ))}
                    </S.EmojiGrid>
                  </S.EmojiPickerContainer>
                </div>
              )}
            </S.ComposerInputContainer>
          </S.ComposerSection>
          
          <S.ComposerActions>
            <S.IconGroup>
              <S.IconButton onClick={handleFileSelect} title="Upload media" disabled={isSubmitting} type="button">
                📷
              </S.IconButton>
              
              <S.IconButton onClick={toggleEmojiPicker} title="Add emoji" disabled={isSubmitting} type="button">
                😊
              </S.IconButton>
              
              <S.IconButton onClick={toggleImageSearch} title="Search for images" disabled={isSubmitting} type="button">
                🔍
              </S.IconButton>
              
            </S.IconGroup>
            
            <div>
              <span style={{ 
                marginRight: '10px', 
                fontSize: '14px', 
                color: content.length > 260 ? '#e0245e' : '#657786' 
              }}>
                {content.length}/280
              </span>
              
              <S.ReplyButton 
                onClick={handleSubmit}
                disabled={isSubmitting || (content.trim() === '' && !selectedFile && !previewUrl)}
                type="button"
              >
                {isSubmitting ? 'Sending...' : 'Reply'}
              </S.ReplyButton>
            </div>
          </S.ComposerActions>
        </S.ModalContent>
      </S.ModalContainer>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }}
        disabled={isSubmitting}
      />
    </S.ModalOverlay>
  );
};

export default CommentModal; 