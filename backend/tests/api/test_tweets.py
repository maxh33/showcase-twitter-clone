import pytest
from rest_framework import status
from tweets.models import Tweet, MediaAttachment
from users.models import User

@pytest.mark.django_db
class TestTweetAPI:
    """Test case for Tweet API endpoints"""
    
    @pytest.fixture
    def create_user(self):
        """Create a test user"""
        return User.objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="ComplexPassword123!"
        )
    
    @pytest.fixture
    def create_tweet(self, create_user):
        """Create a test tweet"""
        return Tweet.objects.create(
            content="This is a test tweet",
            author=create_user
        )
    
    @pytest.fixture
    def api_client(self, create_user):
        """Return an authenticated API client"""
        from rest_framework.test import APIClient
        from rest_framework_simplejwt.tokens import RefreshToken
        
        client = APIClient()
        refresh = RefreshToken.for_user(create_user)
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        return client
    
    def test_list_tweets(self, api_client, create_tweet):
        """Test getting a list of tweets"""
        response = api_client.get("/api/v1/tweets/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1
    
    def test_create_tweet(self, api_client):
        """Test creating a new tweet"""
        data = {"content": "This is a new test tweet"}
        response = api_client.post("/api/v1/tweets/", data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["content"] == data["content"]
    
    def test_retrieve_tweet(self, api_client, create_tweet):
        """Test retrieving a specific tweet"""
        response = api_client.get(f"/api/v1/tweets/{create_tweet.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == create_tweet.id
        assert response.data["content"] == create_tweet.content
    
    def test_update_tweet(self, api_client, create_tweet):
        """Test updating a tweet"""
        data = {"content": "Updated content"}
        response = api_client.patch(f"/api/v1/tweets/{create_tweet.id}/", data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["content"] == data["content"]
    
    def test_delete_tweet(self, api_client, create_tweet):
        """Test deleting a tweet (soft delete)"""
        response = api_client.delete(f"/api/v1/tweets/{create_tweet.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify it's soft deleted (not retrievable)
        response = api_client.get(f"/api/v1/tweets/{create_tweet.id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        
        # Verify it's still in the database but marked as deleted
        tweet = Tweet.objects.get(id=create_tweet.id)
        assert tweet.is_deleted is True
    
    def test_feed_endpoint(self, api_client, create_tweet):
        """Test the feed endpoint"""
        response = api_client.get("/api/v1/tweets/feed/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) >= 1
    
    def test_like_tweet(self, api_client, create_tweet):
        """Test liking a tweet"""
        initial_likes = create_tweet.likes_count
        response = api_client.post(f"/api/v1/tweets/{create_tweet.id}/like/")
        assert response.status_code == status.HTTP_200_OK
        
        # Verify likes count increased
        tweet = Tweet.objects.get(id=create_tweet.id)
        assert tweet.likes_count == initial_likes + 1
    
    def test_retweet(self, api_client, create_tweet):
        """Test retweeting a tweet"""
        initial_retweets = create_tweet.retweet_count
        response = api_client.post(f"/api/v1/tweets/{create_tweet.id}/retweet/")
        assert response.status_code == status.HTTP_200_OK
        
        # Verify retweet count increased
        tweet = Tweet.objects.get(id=create_tweet.id)
        assert tweet.retweet_count == initial_retweets + 1
    
    def test_search_tweet(self, api_client, create_tweet):
        """Test searching for tweets"""
        # Create another tweet with different content
        Tweet.objects.create(
            content="Something completely different",
            author=User.objects.get(username="testuser")
        )
        
        # Search for the first tweet
        search_term = "test tweet"
        response = api_client.get(f"/api/v1/tweets/search/?q={search_term}")
        assert response.status_code == status.HTTP_200_OK
        
        # Should find at least one tweet
        assert len(response.data['results']) >= 1
        
        # First result should contain the search term
        assert search_term in response.data['results'][0]['content'].lower()
    
    def test_special_characters_in_tweet(self, api_client):
        """Test creating a tweet with special characters"""
        data = {"content": "let's code!"}
        response = api_client.post("/api/v1/tweets/", data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["content"] == data["content"]
        
        # Verify the content is stored correctly
        tweet = Tweet.objects.get(id=response.data["id"])
        assert tweet.content == data["content"] 