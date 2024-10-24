import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#028D96',
      light: '#73B5BC',
    },
    secondary: {
      main: '#fff',
      light: '#DCEEEF',
    },
    error: {
      main: '#FF5B17',
    },
  },
});

export default theme;
