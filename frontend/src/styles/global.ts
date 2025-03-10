// src/styles/global.ts
import { createGlobalStyle } from 'styled-components';
import tw from 'tailwind-styled-components';

export const Colors = {
    primary: '#1DA1F2',     // Twitter Blue
    black: '#14171A',       // Twitter Black
    darkGray: '#657786',    // Twitter Dark Gray
    lightGray: '#AAB8C2',   // Twitter Light Gray
    extraLightGray: '#E1E8ED',
    backgroundGray: '#F5F8FA',
    white: '#FFFFFF',
    success: '#17BF63',
    danger: '#E0245E',
}

export const GlobalStyles = createGlobalStyle`
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }

  body {
    background-color: ${Colors.backgroundGray};
    color: ${Colors.black};
  }
`;

// Tailwind-styled components example
export const Container = tw.div`
  max-w-7xl 
  mx-auto 
  px-4 
  sm:px-6 
  lg:px-8
`;

export const Button = tw.button`
  ${(props: { variant: 'primary' | 'secondary' }) => {
    switch (props.variant) {
      case 'primary':
        return 'bg-[#1DA1F2] text-white hover:bg-[#1991DA]';
      case 'secondary':
        return 'bg-[#657786] text-white hover:bg-[#546474]';
      default:
        return 'bg-[#1DA1F2] text-white';
    }
  }}
  px-4 
  py-2 
  rounded-md 
  transition-all 
  duration-300
`;