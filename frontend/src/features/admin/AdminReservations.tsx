import { useQuery } from '@tanstack/react-query';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Chip,
} from '@mui/material';
import { format } from 'date-fns';
import api from '@/lib/api';

export function AdminReservations() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminReservations'],
    queryFn: async () => {
      const response = await api.get('/admin/reservations');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const reservations = data?.data || data?.reservations || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'CANCELED':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Todas las Reservas
      </Typography>

      <TableContainer component={Paper} sx={{ bgcolor: '#1a1a1a' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Película</TableCell>
              <TableCell>Sala</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Butacas</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((reservation: any) => (
              <TableRow key={reservation.id}>
                <TableCell>{reservation.user?.name}</TableCell>
                <TableCell>{reservation.showtime?.movie?.title}</TableCell>
                <TableCell>{reservation.showtime?.screen?.name}</TableCell>
                <TableCell>
                  {reservation.showtime?.startTime &&
                    format(new Date(reservation.showtime.startTime), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {reservation.seats?.map((s: any) => `${s.row}${s.number}`).join(', ')}
                </TableCell>
                <TableCell>${reservation.totalPrice}</TableCell>
                <TableCell>
                  <Chip label={reservation.status} color={getStatusColor(reservation.status)} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
