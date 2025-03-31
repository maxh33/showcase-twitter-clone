import React, { useState, useRef, useEffect } from 'react';
import tweetService from '../../../services/tweetService';
import { fetchRandomImages, UnsplashImage } from '../../../services/imageService';
import { FaImage, FaSmile, FaSearch, FaTimes } from 'react-icons/fa';
import * as S from './styles';
import IconWrapper from '../../common/IconWrapper';
import { refreshToken, setupAuthHeaders } from '../../../services/authService';

// Simple emoji array for the custom emoji picker
const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊',
  '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛',
  '😜', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐',
  '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '❣️', '💕', '💞',
  '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤟',
  '🌍', '🌎', '🌏', '🌐', '🏳️', '🏴', '🏴‍☠️', '🏁', '🚩', '🏳️‍🌈',
  '👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👨‍⚕️', '👩‍⚕️', '👨‍🍳', '👩‍🍳',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨',
  '🚀', '🛸', '🚁', '✈️', '🚂', '🚆', '🚇', '🚌', '🚕', '🏎️'
];

interface TweetComposerProps {
  onTweetCreated?: () => void;
  userProfilePicture?: string;
}

const TweetComposer: React.FC<TweetComposerProps> = ({ 
  onTweetCreated,
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
  
  // Handle clicking outside emoji picker to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Clean up the event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [emojiPickerRef]);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Clear any previous error when user types
    if (errorMessage) setErrorMessage(null);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Close image search if it's open
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
    // Close emoji picker if open
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
  
  const toggleEmojiPicker = () => {
    // Close image search if open
    setShowImageSearch(false);
    setShowEmojiPicker(!showEmojiPicker);
  };
  
  const handleEmojiSelect = (emoji: string) => {
    // Get current cursor position
    const cursorPosition = textInputRef.current?.selectionStart || content.length;
    
    // Insert emoji at cursor position
    const newContent = 
      content.substring(0, cursorPosition) + 
      emoji + 
      content.substring(cursorPosition);
    
    setContent(newContent);
    
    // Focus back on text input and set cursor after emoji
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
      setErrorMessage('Please enter some content or add an image before tweeting.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Ensure auth headers are setup
      setupAuthHeaders();
      
      let createdTweet;
      
      // Create the tweet with or without media
      console.log('TweetComposer: Creating tweet with content:', content);
      try {
        if (selectedFile) {
          createdTweet = await tweetService.createTweet(content, selectedFile);
        } else {
          createdTweet = await tweetService.createTweet(content);
        }
      } catch (error: unknown) {
        // Check if it's an authentication error
        if (error && typeof error === 'object' && 'response' in error && 
            error.response && typeof error.response === 'object' && 
            'status' in error.response && error.response.status === 401) {
          console.log('TweetComposer: Authentication error, refreshing token...');
          // Try to refresh the token
          await refreshToken();
          // Try again with the new token
          console.log('TweetComposer: Retrying tweet creation after token refresh');
          if (selectedFile) {
            createdTweet = await tweetService.createTweet(content, selectedFile);
          } else {
            createdTweet = await tweetService.createTweet(content);
          }
        } else {
          throw error; // Re-throw if it's not an auth error
        }
      }
      
      console.log('TweetComposer: Tweet created successfully:', createdTweet);
      
      // Reset form
      setContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowImageSearch(false);
      setShowEmojiPicker(false);
      
      // Notify parent component
      if (onTweetCreated) {
        console.log('TweetComposer: Calling onTweetCreated callback');
        onTweetCreated();
      } else {
        console.warn('TweetComposer: onTweetCreated callback not provided');
      }
    } catch (error) {
      console.error('TweetComposer: Error creating tweet:', error);
      setErrorMessage('Failed to create tweet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderActionButtons = () => (
    <S.ActionButtons>
      <IconWrapper
        icon={FaImage}
        onClick={handleFileSelect}
        size="small"
        color="primary"
      />
      <IconWrapper
        icon={FaSmile}
        onClick={toggleEmojiPicker}
        size="small"
        color="primary"
      />
      <IconWrapper
        icon={FaSearch}
        onClick={toggleImageSearch}
        size="small"
        color="primary"
      />
      {previewUrl && (
        <IconWrapper
          icon={FaTimes}
          onClick={handleRemoveFile}
          size="small"
          color="error"
        />
      )}
    </S.ActionButtons>
  );
  
  return (
    <S.TweetComposerWrapper>
      <S.ProfileImage src={userProfilePicture} alt="Profile" />
      <S.ComposerContent>
        <S.TextArea
          ref={textInputRef}
          value={content}
          onChange={handleContentChange}
          placeholder="What's happening?"
          rows={3}
        />
        {renderActionButtons()}
        {previewUrl && (
          <S.PreviewContainer>
            <S.ImagePreview src={previewUrl} alt="Selected media" />
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
            <S.PickerContainer>
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
            </S.PickerContainer>
          </div>
        )}
      </S.ComposerContent>
      <S.ComposerActions>
        <div>
          <span style={{ 
            marginRight: '10px', 
            fontSize: '14px', 
            color: content.length > 260 ? '#e0245e' : '#657786' 
          }}>
            {content.length}/280
          </span>
          
          <S.TweetButton 
            onClick={handleSubmit}
            disabled={isSubmitting || (content.trim() === '' && !selectedFile && !previewUrl)}
            type="button"
          >
            {isSubmitting ? 'Posting...' : 'Tweet'}
          </S.TweetButton>
        </div>
      </S.ComposerActions>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }}
        disabled={isSubmitting}
      />
    </S.TweetComposerWrapper>
  );
};

export default TweetComposer;
