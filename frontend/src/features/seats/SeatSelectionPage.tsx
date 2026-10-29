import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Container, Typography, Box, Button, Grid, Paper, Chip, CircularProgress } from '@mui/material';
import { useAuth } from '@/features/auth/AuthContext';
import { toast } from 'sonner';
import api from '@/lib/api';

export function SeatSelectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const { data: seatsData, isLoading } = useQuery({
    queryKey: ['seats', id],
    queryFn: async () => {
      const response = await api.get(`/showtimes/${id}/seats`);
      return response.data;
    },
  });

  const { data: showtime } = useQuery({
    queryKey: ['showtime', id],
    queryFn: async () => {
      const response = await api.get(`/showtimes/${id}`);
      return response.data;
    },
  });

  const reservationMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/reservations', {
        showtimeId: id,
        seatIds: selectedSeats,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Reserva creada exitosamente');
      navigate('/reservations');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la reserva');
    },
  });

  const handleSeatClick = (seatId: string, status: string) => {
    if (status === 'OCCUPIED') return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleReserve = () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para reservar');
      navigate('/login');
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error('Selecciona al menos un asiento');
      return;
    }
    reservationMutation.mutate();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const seats = seatsData?.seats || [];
  const price = showtime?.ticketPrice || showtime?.price || 0;
  const total = selectedSeats.length * price;

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Seleccionar Butacas
      </Typography>
      {showtime && (
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {showtime.movie?.title} - Sala {showtime.screen?.name} - ${price} c/u
        </Typography>
      )}

      <Paper sx={{ p: 4, mt: 3, bgcolor: '#1a1a1a', textAlign: 'center' }}>
        <Box
          sx={{
            width: '80%',
            height: 10,
            bgcolor: '#d32f2f',
            mx: 'auto',
            mb: 4,
            borderRadius: 2,
          }}
        />
        <Typography variant="caption" sx={{ display: 'block', mb: 3 }}>
          PANTALLA
        </Typography>

        <Grid container spacing={1} justifyContent="center" sx={{ maxWidth: 600, mx: 'auto' }}>
          {seats.map((seat: any) => (
            <Grid size={{ xs: 1.5, sm: 1 }} key={seat.id}>
              <Button
                variant="contained"
                size="small"
                disabled={seat.status === 'OCCUPIED'}
                onClick={() => handleSeatClick(seat.id, seat.status)}
                sx={{
                  minWidth: 40,
                  height: 40,
                  bgcolor:
                    seat.status === 'OCCUPIED'
                      ? '#666'
                      : selectedSeats.includes(seat.id)
                      ? '#ffd700'
                      : '#2e7d32',
                  color: selectedSeats.includes(seat.id) ? '#000' : '#fff',
                  '&:hover': {
                    bgcolor:
                      seat.status === 'OCCUPIED'
                        ? '#666'
                        : selectedSeats.includes(seat.id)
                        ? '#ffd700'
                        : '#4caf50',
                  },
                }}
              >
                {seat.row}{seat.number}
              </Button>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip label="Libre" sx={{ bgcolor: '#2e7d32' }} />
          <Chip label="Seleccionado" sx={{ bgcolor: '#ffd700', color: '#000' }} />
          <Chip label="Ocupado" sx={{ bgcolor: '#666' }} />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mt: 3, bgcolor: '#1a1a1a' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">
              Asientos seleccionados: {selectedSeats.length}
            </Typography>
            <Typography variant="body1">Total: ${total}</Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={handleReserve}
            disabled={selectedSeats.length === 0 || reservationMutation.isPending}
          >
            {reservationMutation.isPending ? 'Reservando...' : 'Confirmar Reserva'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
