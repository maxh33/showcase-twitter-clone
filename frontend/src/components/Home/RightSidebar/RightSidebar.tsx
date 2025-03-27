import React, { useState, useEffect, useCallback } from 'react';
import { IconContext } from 'react-icons';
import * as S from './styles';
import { fetchRandomUsers, RandomUser } from '../../../services/userGeneratorService';

// Expanded mock data for trends
const ALL_TRENDS = [
  { category: 'Trending in Germany', title: 'Revolution', tweets: '50.4K Tweets' },
  { category: 'Politics · Trending', title: 'Election', tweets: '125K Tweets' },
  { category: 'Sports · Trending', title: 'Champions League', tweets: '80.3K Tweets' },
  { category: 'Entertainment · Trending', title: 'Movie Awards', tweets: '45.2K Tweets' },
  { category: 'Technology · Trending', title: 'Artificial Intelligence', tweets: '220K Tweets' },
  { category: 'Business · Trending', title: 'Cryptocurrency', tweets: '78.9K Tweets' },
  { category: 'Health · Trending', title: 'Pandemic', tweets: '150K Tweets' },
  { category: 'Science · Trending', title: 'Space Exploration', tweets: '62.1K Tweets' },
];

// Maximum number of users to show in "You might like" section
const MAX_SUGGESTED_USERS = 12;
const USERS_PER_PAGE = 3;

const RightSidebar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allSuggestedUsers, setAllSuggestedUsers] = useState<RandomUser[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<RandomUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [displayedTrends, setDisplayedTrends] = useState(ALL_TRENDS.slice(0, 4));
  const [showAllTrends, setShowAllTrends] = useState(false);
  
  // Fetch random users on component mount
  const loadRandomUsers = useCallback(async (count = USERS_PER_PAGE) => {
    // Don't load more if we've reached the limit
    if (allSuggestedUsers.length >= MAX_SUGGESTED_USERS) {
      return;
    }
    
    // Calculate how many more users to load
    const remainingSlots = MAX_SUGGESTED_USERS - allSuggestedUsers.length;
    const usersToLoad = Math.min(count, remainingSlots);
    
    if (usersToLoad <= 0) return;
    
    setIsLoadingUsers(true);
    try {
      const users = await fetchRandomUsers(usersToLoad);
      setAllSuggestedUsers(prev => {
        // Filter out any duplicate users by id
        const existingIds = new Set(prev.map(user => user.id));
        const newUsers = users.filter(user => !existingIds.has(user.id));
        return [...prev, ...newUsers].slice(0, MAX_SUGGESTED_USERS);
      });
    } catch (error) {
      console.error('Error loading random users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [allSuggestedUsers.length]);
  
  // Initialize displayed users when all users are loaded
  useEffect(() => {
    // Always show the first chunk of users (up to USERS_PER_PAGE)
    setDisplayedUsers(allSuggestedUsers.slice(0, USERS_PER_PAGE));
  }, [allSuggestedUsers]);
  
  // Initial load of users
  useEffect(() => {
    loadRandomUsers(USERS_PER_PAGE);
  }, [loadRandomUsers]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleShowMoreUsers = () => {
    // If we don't have enough loaded users, fetch more
    if (allSuggestedUsers.length < MAX_SUGGESTED_USERS) {
      loadRandomUsers(USERS_PER_PAGE);
    }
    
    // Show more of the already loaded users
    const currentlyShowing = displayedUsers.length;
    const nextBatch = Math.min(currentlyShowing + USERS_PER_PAGE, allSuggestedUsers.length);
    setDisplayedUsers(allSuggestedUsers.slice(0, nextBatch));
  };
  
  const handleShowMoreTrends = () => {
    setShowAllTrends(true);
    setDisplayedTrends(ALL_TRENDS);
  };
  
  return (
    <IconContext.Provider value={{ className: 'react-icons' }}>
      <S.RightSidebarContainer>
        <S.SearchContainer>
          <S.SearchInput 
            placeholder="Search Twitter" 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </S.SearchContainer>
        
        <S.Card>
          <S.CardHeader>Trends for you</S.CardHeader>
          
          {displayedTrends.map((trend, index) => (
            <S.TrendItem key={index}>
              <S.TrendCategory>{trend.category}</S.TrendCategory>
              <S.TrendTitle>{trend.title}</S.TrendTitle>
              <S.TrendTweets>{trend.tweets}</S.TrendTweets>
            </S.TrendItem>
          ))}
          
          {!showAllTrends && (
            <S.CardFooter onClick={handleShowMoreTrends}>Show more</S.CardFooter>
          )}
        </S.Card>
        
        <S.Card>
          <S.CardHeader>You might like</S.CardHeader>
          
          {isLoadingUsers && displayedUsers.length === 0 ? (
            <S.LoadingState>Loading suggestions...</S.LoadingState>
          ) : (
            displayedUsers.map((user) => (
              <S.SuggestedUser key={user.id}>
                <S.UserAvatar src={user.avatar} alt={user.name} />
                <S.UserInfo>
                  <S.UserName>{user.name}</S.UserName>
                  <S.UserHandle>@{user.handle}</S.UserHandle>
                </S.UserInfo>
                <S.FollowButton>Follow</S.FollowButton>
              </S.SuggestedUser>
            ))
          )}
          
          {displayedUsers.length < allSuggestedUsers.length || allSuggestedUsers.length < MAX_SUGGESTED_USERS ? (
            <S.CardFooter onClick={handleShowMoreUsers}>
              {isLoadingUsers ? 'Loading...' : 'Show more'}
            </S.CardFooter>
          ) : null}
        </S.Card>
        
        <S.Footer>
          <S.FooterLink href="https://github.com/maxh33" target="_blank" rel="noopener noreferrer">Terms of Service</S.FooterLink>
          <S.FooterLink href="https://github.com/maxh33" target="_blank" rel="noopener noreferrer">Privacy Policy</S.FooterLink>
          <S.FooterLink href="https://github.com/maxh33" target="_blank" rel="noopener noreferrer">Cookie Policy</S.FooterLink>
          <S.FooterLink href="https://github.com/maxh33" target="_blank" rel="noopener noreferrer">Accessibility</S.FooterLink>
          <S.FooterLink href="https://github.com/maxh33" target="_blank" rel="noopener noreferrer">Ads Info</S.FooterLink>
          <S.FooterLink href="https://github.com/maxh33" target="_blank" rel="noopener noreferrer">
            Built by maxhaider.dev
          </S.FooterLink>
          <S.Copyright>© {new Date().getFullYear()} Twitter Clone</S.Copyright>
        </S.Footer>
      </S.RightSidebarContainer>
    </IconContext.Provider>
  );
};

export default RightSidebar; 