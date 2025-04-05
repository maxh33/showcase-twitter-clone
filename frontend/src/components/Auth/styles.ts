import styled from 'styled-components';
import { Colors } from '../../styles/global';

export const AuthContainer = styled.div`
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: ${Colors.white};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const BannerContainer = styled.div`
  flex: 1;
  background-color: ${Colors.primary};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 200px;
    flex: none;
  }
`;

export const BannerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const FormContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

export const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

export const Logo = styled.img`
  width: 50px;
  height: auto;
`;

export const FormTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${Colors.black};
  margin-bottom: 2rem;
  text-align: center;
`;

export const Form = styled.form`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const FormGroup = styled.div`
  margin-bottom: 0;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${Colors.darkGray};
  margin-bottom: 0.5rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${Colors.extraLightGray};
  border-radius: 8px;
  font-size: 16px;
  color: ${Colors.black};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${Colors.primary};
    box-shadow: 0 0 0 2px rgba(29, 161, 242, 0.2);
  }

  &::placeholder {
    color: ${Colors.lightGray};
  }
`;

export const ButtonContainer = styled.div`
  margin-top: 2rem;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const LinkContainer = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

export const LinkText = styled.p`
  font-size: 14px;
  color: ${Colors.darkGray};
`;

export const StyledLink = styled.a`
  color: ${Colors.primary};
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const ErrorMessage = styled.div`
  color: ${Colors.danger};
  background-color: ${Colors.dangerLight};
  border: 1px solid ${Colors.dangerBorder};
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  text-align: center;
`;

export const SuccessMessage = styled.div`
  color: ${Colors.success};
  background-color: ${Colors.successLight};
  border: 1px solid ${Colors.successBorder};
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  text-align: center;
`;

export const InfoMessage = styled.div`
  color: ${Colors.primary};
  background-color: ${Colors.primaryLight};
  border: 1px solid ${Colors.primaryBorder};
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  text-align: center;
`;
