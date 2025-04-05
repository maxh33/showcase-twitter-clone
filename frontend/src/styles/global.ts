import { createGlobalStyle } from 'styled-components';

export const Colors = {
    primary: '#0066ff',
    primaryLight: '#e3f2fd',
    primaryBorder: '#bbdefb',
    black: '#1a1a1a',
    darkGray: '#666666',
    lightGray: '#999999',
    extraLightGray: '#e6e6e6',
    backgroundGray: '#f9f9f9',
    white: '#ffffff',
    success: '#2e7d32',
    successLight: '#e8f5e9',
    successBorder: '#c8e6c9',
    danger: '#e0245e',
    dangerLight: '#ffebee',
    dangerBorder: '#ffcdd2',
    blue: '#1da1f2',
    red: '#e0245e'
}

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
  }

  body {
    background-color: ${Colors.backgroundGray};
    color: ${Colors.black};
    overflow-x: hidden;
  }
`;

// CSS classes that can be used with the className prop
export const ButtonStyles = {
  primary: `
    bg-[#1DA1F2] 
    text-white 
    hover:bg-[#1991DA]
    px-4 
    py-2 
    rounded-md 
    transition-all 
    duration-300
  `,
  secondary: `
    bg-transparent
    text-[#1DA1F2]
    border
    border-[#1DA1F2]
    hover:bg-[#1991DA10]
    px-4 
    py-2 
    rounded-md 
    transition-all 
    duration-300
  `
};