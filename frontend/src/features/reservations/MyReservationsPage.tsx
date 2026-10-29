import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Typography, Card, CardContent, Button, Box, Chip, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '@/lib/api';

export function MyReservationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['myReservations'],
    queryFn: async () => {
      const response = await api.get('/reservations');
      return response.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/reservations/${id}/cancel`);
    },
    onSuccess: () => {
      toast.success('Reserva cancelada');
      queryClient.invalidateQueries({ queryKey: ['myReservations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al cancelar');
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const reservations = data?.reservations || [];

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
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Mis Reservas
      </Typography>
      {reservations.length === 0 ? (
        <Typography>No tienes reservas aún</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reservations.map((reservation: any) => (
            <Card key={reservation.id} sx={{ bgcolor: '#1a1a1a' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{reservation.showtime?.movie?.title}</Typography>
                  <Chip label={reservation.status} color={getStatusColor(reservation.status)} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Sala {reservation.showtime?.screen?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {reservation.showtime?.startTime &&
                    format(new Date(reservation.showtime.startTime), "EEEE d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Butacas: {reservation.seats?.map((s: any) => `${s.row}${s.number}`).join(', ')}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Total: ${reservation.totalPrice}
                </Typography>
                {reservation.status !== 'CANCELED' && (
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ mt: 2 }}
                    onClick={() => cancelMutation.mutate(reservation.id)}
                    disabled={cancelMutation.isPending}
                  >
                    Cancelar Reserva
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
