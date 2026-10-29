import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { AppNavbar } from './AppNavbar';

export function AppLayout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0f0f0f' }}>
      <AppNavbar />
      <Box component="main" sx={{ py: 4 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
