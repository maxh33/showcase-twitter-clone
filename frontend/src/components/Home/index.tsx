import React from 'react';
import Sidebar from './Sidebar/Sidebar';
import Feed from './Feed/Feed';
import RightSidebar from './RightSidebar/RightSidebar';
import { HomeContainer, MainContent, LoadingContainer } from './styles';

interface HomeProps {
  authenticated: boolean;
  loading: boolean;
  currentUser?: {
    name: string;
    handle: string;
    avatar: string;
  };
  formattedUser?: {
    id: string;
    username: string;
    profile_picture: string | null;
    email: string;
  };
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({
  authenticated,
  loading,
  currentUser,
  formattedUser,
  onLogout
}) => {
  if (!authenticated || loading) {
    return <LoadingContainer>Loading...</LoadingContainer>;
  }

  return (
    <HomeContainer>
      <Sidebar
        activeItem="home"
        userInfo={currentUser}
        onLogout={onLogout}
      />
      <MainContent>
        <Feed currentUser={formattedUser} />
      </MainContent>
      <RightSidebar />
    </HomeContainer>
  );
};

export default Home;
 