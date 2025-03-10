import 'styled-components';
import { Colors } from '../styles/global';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: typeof Colors;
    borderRadius: {
      small: string;
      medium: string;
      large: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
    };
  }
}