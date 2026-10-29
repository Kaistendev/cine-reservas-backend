import { useQuery } from '@tanstack/react-query';
import { Container, Grid, Typography, CircularProgress, Box } from '@mui/material';
import { MovieCard } from './MovieCard';
import api from '@/lib/api';

export function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const response = await api.get('/movies');
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

  if (error) {
    return (
      <Container>
        <Typography color="error">Error al cargar las películas</Typography>
      </Container>
    );
  }

  const movies = data?.data || data?.movies || [];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Cartelera
      </Typography>
      <Grid container spacing={3}>
        {movies.map((movie: any) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={movie.id}>
            <MovieCard movie={movie} />
          </Grid>
        ))}
      </Grid>
      {movies.length === 0 && (
        <Typography align="center" sx={{ mt: 4 }}>
          No hay películas disponibles
        </Typography>
      )}
    </Container>
  );
}
