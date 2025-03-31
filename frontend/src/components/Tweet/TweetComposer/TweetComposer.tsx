import React, { useState, useRef, useEffect } from 'react';
import tweetService from '../../../services/tweetService';
import { fetchRandomImages, UnsplashImage } from '../../../services/imageService';
import { IconContext } from 'react-icons';
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
      } catch (error: any) {
        // Check if it's an authentication error
        if (error.response && error.response.status === 401) {
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
        setTimeout(() => {
          onTweetCreated();
        }, 100); // Small delay to ensure the tweet is registered in the database
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
  
  return (
    <IconContext.Provider value={{ className: 'react-icons' }}>
      <S.ComposerContainer>
        <S.ComposerContent>
          <S.Avatar src={userProfilePicture} alt="Your profile" />
          
          <S.ComposerForm>
            <S.TextInput 
              placeholder="What's happening?"
              value={content}
              onChange={handleContentChange}
              maxLength={280}
              ref={textInputRef}
            />
            
            {previewUrl && (
              <S.PreviewContainer>
                <S.ImagePreview src={previewUrl} alt="Selected media" />
                <S.RemoveButton onClick={handleRemoveFile}>
                  <IconWrapper icon={FaTimes} asButton={false} />
                </S.RemoveButton>
              </S.PreviewContainer>
            )}
            
            {errorMessage && (
              <S.ErrorMessage>{errorMessage}</S.ErrorMessage>
            )}
            
            {showImageSearch && (
              <S.ImageSearchContainer>
                <S.SearchForm onSubmit={handleImageSearchSubmit}>
                  <S.SearchInput
                    placeholder="Search for images..."
                    value={imageSearchQuery}
                    onChange={(e) => setImageSearchQuery(e.target.value)}
                  />
                  <S.SearchButton type="submit">Search</S.SearchButton>
                </S.SearchForm>
                
                <S.ImageGrid>
                  {isLoadingImages ? (
                    <S.LoadingMessage>Loading images...</S.LoadingMessage>
                  ) : unsplashImages.length > 0 ? (
                    unsplashImages.map((image) => (
                      <S.ImageThumbnail
                        key={image.id}
                        src={image.url}
                        alt={image.alt_description || 'Unsplash image'}
                        onClick={() => handleUnsplashImageSelect(image)}
                      />
                    ))
                  ) : (
                    <S.NoResultsMessage>No images found. Try a different search.</S.NoResultsMessage>
                  )}
                </S.ImageGrid>
                
                <div style={{ padding: '8px 16px', fontSize: '12px', color: '#657786', textAlign: 'center' }}>
                  Images provided by <a href="https://unsplash.com/" target="_blank" rel="noopener noreferrer">Unsplash</a>
                </div>
              </S.ImageSearchContainer>
            )}
            
            {showEmojiPicker && (
              <div ref={emojiPickerRef}>
                <S.PickerContainer>
                  <S.EmojiPickerHeader>
                    <h3>Emojis</h3>
                    <S.CloseButton onClick={() => setShowEmojiPicker(false)}>✕</S.CloseButton>
                  </S.EmojiPickerHeader>
                  <S.EmojiGrid>
                    {EMOJI_LIST.map((emoji, index) => (
                      <S.EmojiButton 
                        key={index} 
                        onClick={() => {
                          handleEmojiSelect(emoji);
                          setShowEmojiPicker(false);
                        }}
                      >
                        {emoji}
                      </S.EmojiButton>
                    ))}
                  </S.EmojiGrid>
                </S.PickerContainer>
              </div>
            )}
            
            <S.ComposerActions>
              <S.IconGroup>
                <S.IconButton onClick={handleFileSelect} title="Upload media">
                  <IconWrapper icon={FaImage} asButton={false} />
                </S.IconButton>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  style={{ display: 'none' }}
                />
                
                <S.IconButton onClick={toggleImageSearch} title="Search for images">
                  <IconWrapper icon={FaSearch} asButton={false} />
                </S.IconButton>
                
                <S.IconButton onClick={toggleEmojiPicker} title="Add emoji">
                  <IconWrapper icon={FaSmile} asButton={false} />
                </S.IconButton>
              </S.IconGroup>
              
              <div>
                <span style={{ marginRight: '10px', fontSize: '14px', color: content.length > 260 ? '#e0245e' : '#657786' }}>
                  {content.length}/280
                </span>
                
                <S.TweetButton 
                  onClick={handleSubmit}
                  disabled={isSubmitting || (content.trim() === '' && !selectedFile && !previewUrl)}
                >
                  {isSubmitting ? 'Posting...' : 'Tweet'}
                </S.TweetButton>
              </div>
            </S.ComposerActions>
          </S.ComposerForm>
        </S.ComposerContent>
      </S.ComposerContainer>
    </IconContext.Provider>
  );
};

export default TweetComposer;
