import React, { useState, useRef, useEffect } from 'react';
import { IconContext } from 'react-icons';
import { FaImage, FaSmile, FaSearch, FaTimes } from 'react-icons/fa';
import IconWrapper from '../../common/IconWrapper';
import { EMOJI_LIST } from '../../common/constants';
import { fetchRandomImages, UnsplashImage } from '../../../services/imageService';
import tweetService, { Tweet } from '../../../services/tweetService';
import * as S from './styles';

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
  replyingTo: FlexibleTweet;
  userProfilePicture?: string;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  replyingTo,
  userProfilePicture = 'https://via.placeholder.com/50'
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
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  useEffect(() => {
    function handleClickOutsideEmoji(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutsideEmoji);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideEmoji);
    };
  }, []);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (errorMessage) setErrorMessage(null);
  };
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setShowImageSearch(false);
      setShowEmojiPicker(false);
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
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);
  
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
      <S.ModalContent ref={modalRef}>
        <S.ModalHeader>
          <button onClick={onClose}>
            <IconWrapper icon={FaTimes} />
          </button>
        </S.ModalHeader>
        
        <S.ModalBody>
          <S.UserAvatar src={userProfilePicture} alt="User avatar" />
          <S.CommentForm>
            <S.TextArea
              ref={textInputRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Tweet your reply"
              maxLength={140}
            />
            
            {previewUrl && (
              <S.ImagePreviewContainer>
                <S.ImagePreview src={previewUrl} alt="Selected media" />
                <S.RemoveImageButton onClick={handleRemoveFile}>
                  <IconWrapper icon={FaTimes} />
                </S.RemoveImageButton>
              </S.ImagePreviewContainer>
            )}
            
            <S.ActionBar>
              <S.MediaActions>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <IconContext.Provider value={{ size: '20px' }}>
                  <button onClick={handleFileSelect}>
                    <IconWrapper icon={FaImage} />
                  </button>
                  <button onClick={toggleImageSearch}>
                    <IconWrapper icon={FaSearch} />
                  </button>
                  <button 
                    onClick={toggleEmojiPicker}
                    className={showEmojiPicker ? 'active' : ''}
                  >
                    <IconWrapper icon={FaSmile} />
                  </button>
                </IconContext.Provider>

                {showEmojiPicker && (
                  <S.EmojiPicker ref={emojiPickerRef}>
                    {EMOJI_LIST.map((emoji, index) => (
                      <S.EmojiButton
                        key={index}
                        onClick={() => handleEmojiSelect(emoji)}
                        type="button"
                      >
                        {emoji}
                      </S.EmojiButton>
                    ))}
                  </S.EmojiPicker>
                )}
              </S.MediaActions>
              
              <S.CharacterCount warning={content.length > 120}>
                {140 - content.length}
              </S.CharacterCount>
              
              <S.SubmitButton
                onClick={handleSubmit}
                disabled={isSubmitting || (content.trim() === '' && !selectedFile && !previewUrl)}
              >
                Reply
              </S.SubmitButton>
            </S.ActionBar>
            
            {errorMessage && <S.ErrorMessage>{errorMessage}</S.ErrorMessage>}
          </S.CommentForm>
        </S.ModalBody>
        
        {showImageSearch && (
          <S.ImageSearchContainer>
            <S.SearchForm onSubmit={handleImageSearchSubmit}>
              <S.SearchInput
                type="text"
                value={imageSearchQuery}
                onChange={(e) => setImageSearchQuery(e.target.value)}
                placeholder="Search for images..."
              />
              <S.SearchButton type="submit">
                <IconWrapper icon={FaSearch} />
              </S.SearchButton>
            </S.SearchForm>
            
            <S.ImageGrid>
              {isLoadingImages ? (
                <S.LoadingText>Loading images...</S.LoadingText>
              ) : (
                unsplashImages.map((image) => (
                  <S.ImageGridItem
                    key={image.id}
                    onClick={() => handleUnsplashImageSelect(image)}
                  >
                    <img src={image.url} alt={image.alt_description} />
                  </S.ImageGridItem>
                ))
              )}
            </S.ImageGrid>
          </S.ImageSearchContainer>
        )}
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default CommentModal; 