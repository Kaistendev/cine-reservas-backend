import { useQuery } from '@tanstack/react-query';
import { Typography, Grid, Card, CardContent, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '@/lib/api';

export function AdminReports() {
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Reportes
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: '#1a1a1a' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ingresos
              </Typography>
              <Typography variant="h4" color="primary">
                ${revenueData?.totalRevenue || 0}
              </Typography>
              <Typography color="text.secondary">
                Total de reservas: {revenueData?.totalReservations || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: '#1a1a1a' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ocupación
              </Typography>
              <Typography variant="h4" color="primary">
                {occupancyData?.averageOccupancy?.toFixed(1) || 0}%
              </Typography>
              <Typography color="text.secondary">
                Promedio de ocupación por función
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {revenueData?.revenueByMovie && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Ingresos por Película
          </Typography>
          <TableContainer component={Paper} sx={{ bgcolor: '#1a1a1a' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Película</TableCell>
                  <TableCell align="right">Reservas</TableCell>
                  <TableCell align="right">Ingresos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {revenueData.revenueByMovie.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item.movieTitle}</TableCell>
                    <TableCell align="right">{item.reservations}</TableCell>
                    <TableCell align="right">${item.revenue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
