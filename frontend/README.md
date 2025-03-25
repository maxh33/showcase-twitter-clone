# Twitter Clone Frontend

This project is a Twitter clone frontend built with React, TypeScript, and Styled Components.

## External APIs Integration

### Random User Generation

This project uses the [randomuser.me](https://randomuser.me/) API to generate realistic user data for demonstration purposes. The integration:

- Provides random users for the "You might like" section
- Generates placeholder user information for tweets when backend data is incomplete
- Creates random user profiles for testing and demonstration

No API key is required for basic usage of randomuser.me.

### Unsplash Images

The application integrates with [Unsplash](https://unsplash.com/) to allow users to search and use high-quality, free images in their tweets. To use this feature:

1. Create an account at [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application to get an API key
3. Copy your access key to `.env` file as `REACT_APP_UNSPLASH_ACCESS_KEY`

Only "Public access" permission is required for this integration.

If no API key is provided, the application will fall back to placeholder images.

## GitHub Actions Setup

For CI/CD deployment, add the following secrets to your GitHub repository:

1. `UNSPLASH_ACCESS_KEY`: Your Unsplash API key
2. `VERCEL_TOKEN`: Your Vercel deployment token
3. `VERCEL_PROJECT_ID`: Your Vercel project ID
4. `VERCEL_ORG_ID`: Your Vercel organization ID

These secrets enable automated deployment to Vercel and ensure the Unsplash API works in the deployed environment.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Environment Variables

Copy `.env.example` to `.env` and adjust the values accordingly:

```
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
