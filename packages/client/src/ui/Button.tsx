import { LoadingButton } from '@mui/lab';
import Button, { ButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const CustomButton = styled(Button)<ButtonProps>(
  ({ color = 'secondary', theme }) => {
    return {
      color: '#060606',
      background: (theme.palette as any)[color].main || '#fff',
      boxShadow: '2px 2px 0px #158D95',
      border: '2px solid #060606',
      padding: '4px 16px',
      borderRadius: '32px',
      height: '32px',
      textTransform: 'none',
      fontSize: '16px',
      lineHeight: '20px',
      fontWeight: '600',
      fontStyle: 'normal',
      fontFamily: "'Montserrat', sans-serif",
      '&:hover': {
        backgroundColor: (theme.palette as any)[color].light || '#DCEEEF',
        border: '2px solid #060606',
      },
    };
  },
);

export const CustomLoadingButton = styled(LoadingButton)<ButtonProps>(
  ({ color = 'secondary', theme }) => {
    return {
      color: '#060606',
      background: (theme.palette as any)[color].main || '#fff',
      boxShadow: '2px 2px 0px #158D95',
      border: '2px solid #060606',
      padding: '4px 16px',
      borderRadius: '32px',
      height: '32px',
      textTransform: 'none',
      fontSize: '16px',
      lineHeight: '20px',
      fontWeight: '600',
      fontStyle: 'normal',
      fontFamily: "'Montserrat', sans-serif",
      '&:hover': {
        backgroundColor: (theme.palette as any)[color].light || '#DCEEEF',
        border: '2px solid #060606',
      },
    };
  },
);

export const AddButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: 'black',
  background: 'transparent',
  border: '1px solid black',
  marginLeft: '1px',
  marginRight: '1px',
  padding: '4px 8px',
  borderRadius: '32px',
  height: '32px',
  textTransform: 'none',
  fontSize: '13px',
  lineHeight: '20px',
  fontWeight: '600',
  fontStyle: 'normal',
  fontFamily: "'Montserrat', sans-serif",
  '&:hover': {
    marginLeft: 0,
    marginRight: 0,
    border: '2px solid black',
  },
}));

export const NoBorderButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: 'black',
  background: 'transparent',
  padding: '4px 16px',
  borderRadius: '32px',
  height: '32px',
  textTransform: 'none',
  fontSize: '16px',
  lineHeight: '20px',
  fontWeight: '600',
  fontStyle: 'normal',
  fontFamily: "'Montserrat', sans-serif",
  '&:hover': {
    background: 'transparent',
  },
}));

export const BottomBorderButton = styled(Button)<ButtonProps>(({ theme }) => ({
  color: 'black',
  background: 'transparent',
  height: '32px',
  fontWeight: '600',
  fontStyle: 'normal',
  fontFamily: "'Montserrat', sans-serif",
  textTransform: 'none',
  '&:hover': {
    background: 'transparent',
  },
}));

export const SortButton = styled(NoBorderButton)`
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0em;
  stroke: black;

  border-radius: 0;
  border-bottom: 3px solid transparent;
  transition: all 0.5s ease-in-out;
  opacity: 0.5;

  &:hover {
    opacity: 0.8;
  }
  &.selected {
    opacity: 1;
    border-bottom-color: var(--yellow);
  }
  &.result {
    opacity: 1;
  }
  &.result:hover {
    opacity: 1;
    border-bottom-color: var(--green);
  }
`;

export default CustomButton;
