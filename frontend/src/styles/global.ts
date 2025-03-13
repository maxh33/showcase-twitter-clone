import { createGlobalStyle } from 'styled-components';

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