import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Container, Grid, Typography, Button, Card, CardContent, Chip, Box, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '@/lib/api';

export function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      const response = await api.get(`/movies/${id}`);
      return response.data;
    },
  });

  const { data: showtimesData, isLoading: showtimesLoading } = useQuery({
    queryKey: ['showtimes', id],
    queryFn: async () => {
      const response = await api.get('/showtimes', { params: { movieId: id } });
      return response.data;
    },
  });

  if (movieLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!movie) {
    return (
      <Container>
        <Typography>Película no encontrada</Typography>
      </Container>
    );
  }

  const showtimes = showtimesData?.data || showtimesData?.showtimes || [];

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: '#1a1a1a' }}>
            <img
              src={movie.posterUrl || 'https://via.placeholder.com/400x600?text=Sin+Imagen'}
              alt={movie.title}
              style={{ width: '100%', height: 'auto' }}
            />
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h3" gutterBottom>
            {movie.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {movie.description}
          </Typography>
          <Box sx={{ mb: 2 }}>
            {(movie.durationMinutes || movie.duration) && (
              <Chip label={`${movie.durationMinutes || movie.duration} min`} sx={{ mr: 1 }} />
            )}
            {movie.categories?.map((cat: any) => (
              <Chip key={cat.id} label={cat.name} sx={{ mr: 1 }} />
            ))}
            {movie.category && <Chip label={movie.category.name} />}
          </Box>

          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Funciones Disponibles
          </Typography>
          {showtimesLoading ? (
            <CircularProgress />
          ) : showtimes.length === 0 ? (
            <Typography>No hay funciones disponibles</Typography>
          ) : (
            <Grid container spacing={2}>
              {showtimes.map((showtime: any) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={showtime.id}>
                  <Card sx={{ bgcolor: '#1a1a1a' }}>
                    <CardContent>
                      <Typography variant="h6">
                        {format(new Date(showtime.startTime), "EEEE d 'de' MMMM", { locale: es })}
                      </Typography>
                      <Typography variant="body1" sx={{ my: 1 }}>
                        {format(new Date(showtime.startTime), 'HH:mm', { locale: es })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sala {showtime.screen?.name} - ${showtime.ticketPrice || showtime.price}
                      </Typography>
                      <Button
                        component={Link}
                        to={`/showtimes/${showtime.id}/seats`}
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Seleccionar Butacas
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
