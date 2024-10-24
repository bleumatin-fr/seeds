import { LoadingButton, LoadingButtonProps } from '@mui/lab';
import { styled } from '@mui/material/styles';

const CustomButton = styled(LoadingButton)<LoadingButtonProps>(
  ({ color = 'secondary', theme }) => ({
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
    '&:disabled': {
      border: '2px solid #06060670',
      cursor: 'progress',
    },
  }),
);

export default CustomButton;
