import React, { useState, useRef, useEffect } from 'react';
import tweetService from '../../../services/tweetService';
import { fetchRandomImages, UnsplashImage } from '../../../services/imageService';
import { FaImage, FaSmile, FaSearch, FaTimes } from 'react-icons/fa';
import * as S from './styles';
import IconWrapper from '../../common/IconWrapper';
import { refreshToken, setupAuthHeaders } from '../../../services/authService';
import { useAuth } from '../../../contexts/AuthContext';
import DemoModal from '../../modal/DemoModal';

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
  userProfilePicture = '/logo192.png'
}) => {
  const { isDemoUser } = useAuth();
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
  const [showDemoModal, setShowDemoModal] = useState(false);
  
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

  const handleUnsplashImageSelect = async (image: UnsplashImage) => {
    try {
      // Download the image with proper CORS headers
      const response = await fetch(image.url, {
        mode: 'cors',
        headers: {
          'Accept': 'image/jpeg'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const filename = `unsplash-${image.id}.jpg`;
      
      // Create a File object from the blob with proper MIME type
      const file = new File([blob], filename, { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      // Set the file and preview URL
      setSelectedFile(file);
      setPreviewUrl(image.url);
      setShowImageSearch(false);
      
      console.log('Successfully created file:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
    } catch (error) {
      console.error('Error downloading Unsplash image:', error);
      setErrorMessage('Failed to download image. Please try again.');
    }
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
  
  const validateTweetContent = (): boolean => {
    if (content.trim() === '' && !selectedFile && !previewUrl) {
      setErrorMessage('Please enter some content or add an image before tweeting.');
      return false;
    }
    return true;
  };

  const createTweetWithMedia = async () => {
    console.log('TweetComposer: Creating tweet with content:', content);
    try {
      if (selectedFile) {
        // Create FormData and append the file
        const formData = new FormData();
        formData.append('content', content);
        formData.append('media', selectedFile);
        
        console.log('TweetComposer: Uploading with file:', {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size
        });
        
        return await tweetService.createTweet(content, selectedFile);
      } else {
        return await tweetService.createTweet(content);
      }
    } catch (error: unknown) {
      if (isAuthError(error)) {
        console.log('TweetComposer: Authentication error, refreshing token...');
        try {
          await refreshToken();
          await setupAuthHeaders();
          // Retry the tweet creation after token refresh
          return selectedFile 
            ? await tweetService.createTweet(content, selectedFile)
            : await tweetService.createTweet(content);
        } catch (refreshError) {
          console.error('TweetComposer: Token refresh failed:', refreshError);
          throw refreshError;
        }
      }
      throw error;
    }
  };

  const isAuthError = (error: unknown): boolean => {
    return Boolean(
      error && 
      typeof error === 'object' && 
      'response' in error && 
      error.response && 
      typeof error.response === 'object' && 
      'status' in error.response && 
      error.response.status === 401
    );
  };

  const resetForm = () => {
    setContent('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowImageSearch(false);
    setShowEmojiPicker(false);
  };

  const notifyParent = () => {
    if (onTweetCreated) {
      console.log('TweetComposer: Calling onTweetCreated callback');
      onTweetCreated();
    } else {
      console.warn('TweetComposer: onTweetCreated callback not provided');
    }
  };
  
  const handleSubmit = async () => {
    if (!validateTweetContent()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Ensure auth headers are setup
      setupAuthHeaders();
      
      const createdTweet = await createTweetWithMedia();
      console.log('TweetComposer: Tweet created successfully:', createdTweet);
      
      resetForm();
      notifyParent();
    } catch (error) {
      console.error('TweetComposer: Error creating tweet:', error);
      setErrorMessage('Failed to create tweet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <S.TweetComposerWrapper>
      <S.ProfileImage src={userProfilePicture} alt="Profile" />
      <S.ComposerContent>
        <S.ComposerForm>
          <S.TextArea
            ref={textInputRef}
            value={content}
            onChange={handleContentChange}
            placeholder="What's happening?"
            rows={3}
          />
          
          {previewUrl && (
            <S.PreviewContainer>
              <S.ImagePreview src={previewUrl} alt="Selected media" />
              <S.RemoveImageButton
                icon={FaTimes}
                onClick={handleRemoveFile}
                size="small"
                color="white"
              />
            </S.PreviewContainer>
          )}

          {showImageSearch && (
            <S.ImageSearchContainer>
              <S.ImagePickerHeader>
                <h3>Search Images</h3>
                <IconWrapper
                  icon={FaTimes}
                  onClick={() => setShowImageSearch(false)}
                  size="small"
                />
              </S.ImagePickerHeader>
              <S.SearchForm onSubmit={handleImageSearchSubmit}>
                <S.SearchInput
                  type="text"
                  value={imageSearchQuery}
                  onChange={(e) => setImageSearchQuery(e.target.value)}
                  placeholder="Search for images..."
                />
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
              <S.UnsplashCredit>
                <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">
                  Images powered by Unsplash
                </a>
              </S.UnsplashCredit>
            </S.ImageSearchContainer>
          )}

          {showEmojiPicker && (
            <div ref={emojiPickerRef}>
              <S.ImagePickerContainer>
                <S.ImagePickerHeader>
                  <h3>Emojis</h3>
                  <IconWrapper
                    icon={FaTimes}
                    onClick={() => setShowEmojiPicker(false)}
                    size="small"
                  />
                </S.ImagePickerHeader>
                <S.EmojiGrid>
                  {EMOJI_LIST.map((emoji, index) => (
                    <S.EmojiButton
                      key={index}
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </S.EmojiButton>
                  ))}
                </S.EmojiGrid>
              </S.ImagePickerContainer>
            </div>
          )}

          <S.ComposerActions>
            <S.IconGroup>
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
            </S.IconGroup>
            <S.TweetButton
              onClick={handleSubmit}
              disabled={isSubmitting || (content.trim() === '' && !selectedFile && !previewUrl)}
            >
              Tweet
            </S.TweetButton>
          </S.ComposerActions>
        </S.ComposerForm>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </S.ComposerContent>
      
      {/* Demo Modal */}
      <DemoModal 
        isOpen={showDemoModal} 
        onClose={() => setShowDemoModal(false)} 
        actionType="tweet" 
      />
    </S.TweetComposerWrapper>
  );
};

export default TweetComposer;
