import React, { useState, useEffect } from 'react';
import { IconContext } from 'react-icons';
import * as S from './styles';
import { fetchRandomUsers, RandomUser } from '../../../services/userGeneratorService';

// Mock data for trends
const TRENDS = [
  { category: 'Trending in Germany', title: 'Revolution', tweets: '50.4K Tweets' },
  { category: 'Politics · Trending', title: 'Election', tweets: '125K Tweets' },
  { category: 'Sports · Trending', title: 'Champions League', tweets: '80.3K Tweets' },
  { category: 'Entertainment · Trending', title: 'Movie Awards', tweets: '45.2K Tweets' },
];

const RightSidebar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedUsers, setSuggestedUsers] = useState<RandomUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  // Fetch random users on component mount
  useEffect(() => {
    const loadRandomUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const users = await fetchRandomUsers(3);
        setSuggestedUsers(users);
      } catch (error) {
        console.error('Error loading random users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    loadRandomUsers();
  }, []);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <IconContext.Provider value={{ className: 'react-icons' }}>
      <S.RightSidebarContainer>
        <S.SearchContainer>
          <S.SearchIcon>
            🔍
          </S.SearchIcon>
          <S.SearchInput 
            placeholder="Search Twitter" 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </S.SearchContainer>
        
        <S.Card>
          <S.CardHeader>Trends for you</S.CardHeader>
          
          {TRENDS.map((trend, index) => (
            <S.TrendItem key={index}>
              <S.TrendCategory>{trend.category}</S.TrendCategory>
              <S.TrendTitle>{trend.title}</S.TrendTitle>
              <S.TrendTweets>{trend.tweets}</S.TrendTweets>
            </S.TrendItem>
          ))}
          
          <S.CardFooter>Show more</S.CardFooter>
        </S.Card>
        
        <S.Card>
          <S.CardHeader>You might like</S.CardHeader>
          
          {isLoadingUsers ? (
            <S.LoadingState>Loading suggestions...</S.LoadingState>
          ) : (
            suggestedUsers.map((user) => (
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
          
          <S.CardFooter>Show more</S.CardFooter>
        </S.Card>
        
        <S.Footer>
          <S.FooterLink href="#">Terms of Service</S.FooterLink>
          <S.FooterLink href="#">Privacy Policy</S.FooterLink>
          <S.FooterLink href="#">Cookie Policy</S.FooterLink>
          <S.FooterLink href="#">Accessibility</S.FooterLink>
          <S.FooterLink href="#">Ads Info</S.FooterLink>
          <S.FooterLink href="#">More</S.FooterLink>
          <S.Copyright>© 2023 Twitter, Inc.</S.Copyright>
        </S.Footer>
      </S.RightSidebarContainer>
    </IconContext.Provider>
  );
};

export default RightSidebar; 