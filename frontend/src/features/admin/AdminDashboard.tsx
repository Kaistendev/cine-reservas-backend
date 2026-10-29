import { useQuery } from '@tanstack/react-query';
import { Typography, Grid, Card, CardContent, Box, CircularProgress } from '@mui/material';
import TheatersIcon from '@mui/icons-material/Theaters';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import api from '@/lib/api';

export function AdminDashboard() {
  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue'],
    queryFn: async () => {
      const response = await api.get('/admin/reports/revenue');
      return response.data;
    },
  });

  const { data: occupancyData, isLoading: occupancyLoading } = useQuery({
    queryKey: ['occupancy'],
    queryFn: async () => {
      const response = await api.get('/admin/reports/occupancy');
      return response.data;
    },
  });

  if (revenueLoading || occupancyLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const cards = [
    {
      title: 'Ingresos Totales',
      value: `$${revenueData?.totalRevenue || 0}`,
      icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Reservas Totales',
      value: revenueData?.totalReservations || 0,
      icon: <ConfirmationNumberIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Ocupación Promedio',
      value: `${occupancyData?.averageOccupancy?.toFixed(1) || 0}%`,
      icon: <TheatersIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card sx={{ bgcolor: '#1a1a1a' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4">{card.value}</Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
