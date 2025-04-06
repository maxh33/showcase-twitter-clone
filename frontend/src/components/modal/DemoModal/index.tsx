import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from './styles';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType?: 'tweet' | 'comment' | 'retweet' | 'general';
}

const DemoModal: React.FC<DemoModalProps> = ({ 
  isOpen, 
  onClose, 
  actionType = 'general' 
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getActionMessage = () => {
    switch (actionType) {
      case 'tweet':
        return "posting tweets";
      case 'comment':
        return "adding comments";
      case 'retweet':
        return "retweeting";
      default:
        return "performing this action";
    }
  };

  const handleRegister = () => {
    onClose();
    setTimeout(() => {
      navigate('/signup');
    }, 50);
  };

  return (
    <S.ModalOverlay>
      <S.ModalContent>
        <S.CloseButton onClick={onClose}>&times;</S.CloseButton>
        
        <S.ModalHeader>
          <S.ModalIcon>🔒</S.ModalIcon>
          <S.ModalTitle>Demo Account Limitation</S.ModalTitle>
        </S.ModalHeader>
        
        <S.ModalBody>
          <S.Message>
            As a demo user, {getActionMessage()} is not available. Create a free account to enjoy all features!
          </S.Message>
          
          <S.Benefits>
            <S.BenefitItem>✓ Post tweets and share your thoughts</S.BenefitItem>
            <S.BenefitItem>✓ Comment on other users' content</S.BenefitItem>
            <S.BenefitItem>✓ Retweet and bookmark content</S.BenefitItem>
            <S.BenefitItem>✓ Customize your profile</S.BenefitItem>
          </S.Benefits>
        </S.ModalBody>
        
        <S.ModalFooter>
          <S.CancelButton onClick={onClose}>Continue with Demo</S.CancelButton>
          <S.RegisterButton onClick={handleRegister}>Create Account</S.RegisterButton>
        </S.ModalFooter>
      </S.ModalContent>
    </S.ModalOverlay>
  );
};

export default DemoModal;
