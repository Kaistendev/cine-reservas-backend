import { Card, CardMedia, CardContent, Typography, Button, CardActions } from '@mui/material';
import { Link } from 'react-router-dom';

interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    description: string;
    durationMinutes?: number;
    duration?: number;
    posterUrl?: string;
  };
}

export function MovieCard({ movie }: MovieCardProps) {
  const duration = movie.durationMinutes || movie.duration;
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1a1a1a' }}>
      <CardMedia
        component="img"
        height="400"
        image={movie.posterUrl || 'https://via.placeholder.com/300x400?text=Sin+Imagen'}
        alt={movie.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {movie.title}
        </Typography>
        {duration && (
          <Typography variant="body2" color="text.secondary">
            {duration} min
          </Typography>
        )}
        <Typography variant="body2" sx={{ mt: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {movie.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/movies/${movie.id}`} fullWidth variant="contained">
          Ver Funciones
        </Button>
      </CardActions>
    </Card>
  );
}
