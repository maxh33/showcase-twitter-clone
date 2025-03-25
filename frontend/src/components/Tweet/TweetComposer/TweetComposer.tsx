import React, { useState, useRef, useEffect } from 'react';
import { createTweet, uploadMedia } from '../../../services/tweetService';
import { fetchRandomImages, UnsplashImage } from '../../../services/imageService';
import { IconContext } from 'react-icons';
import * as S from './styles';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const [imageSearch, setImageSearch] = useState('');
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch random images when the image picker is shown
  useEffect(() => {
    if (showImagePicker) {
      fetchUnsplashImages();
    }
  }, [showImagePicker]);
  
  const fetchUnsplashImages = async (query = '') => {
    setIsLoadingImages(true);
    try {
      const images = await fetchRandomImages(query, 9);
      setUnsplashImages(images);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  const handleImageSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageSearch.trim()) {
      fetchUnsplashImages(imageSearch);
    }
  };
  
  const handleImageSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageSearch(e.target.value);
  };
  
  const handleSubmit = async () => {
    if (content.trim() === '' && !selectedFile && !previewUrl) return;
    
    setIsSubmitting(true);
    
    try {
      // Create the tweet
      const tweetData = { content };
      const createdTweet = await createTweet(tweetData);
      
      // If there's a file from local upload, upload it
      if (selectedFile) {
        await uploadMedia(createdTweet.id, selectedFile);
      }
      // If there's a URL from Unsplash, upload it
      else if (previewUrl) {
        // Here you would typically upload the image to your backend
        // For now we'll just log it
        console.log('Uploading Unsplash image:', previewUrl);
      }
      
      // Reset form
      setContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Notify parent component
      if (onTweetCreated) {
        onTweetCreated();
      }
    } catch (error) {
      console.error('Error creating tweet:', error);
    } finally {
      setIsSubmitting(false);
    }
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
      
      // Close image picker if it's open
      setShowImagePicker(false);
    }
  };
  
  const handleUnsplashImageSelect = (image: UnsplashImage) => {
    setPreviewUrl(image.url);
    setSelectedFile(null);
    setShowImagePicker(false);
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const toggleImagePicker = () => {
    setShowImagePicker(!showImagePicker);
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
            />
            
            {previewUrl && (
              <S.PreviewContainer>
                <S.ImagePreview src={previewUrl} alt="Selected media" />
                <S.RemoveButton onClick={handleRemoveFile}>✕</S.RemoveButton>
              </S.PreviewContainer>
            )}
            
            {showImagePicker && (
              <S.ImagePickerContainer>
                <S.ImagePickerHeader>
                  <h3>Select an Image</h3>
                  <S.CloseButton onClick={toggleImagePicker}>
                    ✕
                  </S.CloseButton>
                </S.ImagePickerHeader>
                
                <S.SearchForm onSubmit={handleImageSearch}>
                  <S.SearchInput 
                    placeholder="Search for images..."
                    value={imageSearch}
                    onChange={handleImageSearchInput}
                  />
                  <S.SearchButton type="submit">
                    🔍
                  </S.SearchButton>
                </S.SearchForm>
                
                {isLoadingImages ? (
                  <S.LoadingState>Loading images...</S.LoadingState>
                ) : (
                  <S.ImageGrid>
                    {unsplashImages.map(image => (
                      <S.ImageGridItem 
                        key={image.id}
                        onClick={() => handleUnsplashImageSelect(image)}
                      >
                        <img 
                          src={image.url} 
                          alt={image.alt_description} 
                          loading="lazy"
                        />
                      </S.ImageGridItem>
                    ))}
                  </S.ImageGrid>
                )}
                
                <S.UnsplashCredit>
                  Images provided by <a href="https://unsplash.com/" target="_blank" rel="noopener noreferrer">Unsplash</a>
                </S.UnsplashCredit>
              </S.ImagePickerContainer>
            )}
            
            <S.ComposerActions>
              <S.IconGroup>
                <S.IconButton onClick={handleFileSelect} title="Upload from device">
                  📸
                </S.IconButton>
                <S.FileInput 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/gif,video/mp4" 
                />
                
                <S.IconButton onClick={toggleImagePicker} title="Search Unsplash images">
                  🔍
                </S.IconButton>
                
                <S.IconButton>
                  🎞️
                </S.IconButton>
                
                <S.IconButton>
                  🎁
                </S.IconButton>
                
                <S.IconButton>
                  😊
                </S.IconButton>
                
                <S.IconButton>
                  🌐
                </S.IconButton>
              </S.IconGroup>
              
              <S.TweetButton 
                onClick={handleSubmit}
                disabled={isSubmitting || (content.trim() === '' && !selectedFile && !previewUrl)}
              >
                Tweet
              </S.TweetButton>
            </S.ComposerActions>
          </S.ComposerForm>
        </S.ComposerContent>
      </S.ComposerContainer>
    </IconContext.Provider>
  );
};

export default TweetComposer;
