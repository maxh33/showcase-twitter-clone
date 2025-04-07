import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://maxh33.pythonanywhere.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ... existing code ... 