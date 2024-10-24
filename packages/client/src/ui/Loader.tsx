import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

interface LoaderProps {
  fullPage: boolean;
}

const Loader = ({ fullPage }: LoaderProps) => {
  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default Loader;
