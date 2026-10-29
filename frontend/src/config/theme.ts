import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d32f2f',
    },
    secondary: {
      main: '#ffd700',
    },
    background: {
      default: '#0f0f0f',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
});
