import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import api from '@/lib/api';

export function AdminMovies() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminMovies'],
    queryFn: async () => {
      const response = await api.get('/movies');
      return response.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
    refetchOnMount: true,
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/movies', data);
    },
    onSuccess: () => {
      toast.success('Película creada');
      queryClient.invalidateQueries({ queryKey: ['adminMovies'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: any) => {
      await api.put(`/movies/${id}`, data);
    },
    onSuccess: () => {
      toast.success('Película actualizada');
      queryClient.invalidateQueries({ queryKey: ['adminMovies'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/movies/${id}`);
    },
    onSuccess: () => {
      toast.success('Película eliminada');
      queryClient.invalidateQueries({ queryKey: ['adminMovies'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    },
  });

  const handleOpen = (movie?: any) => {
    if (movie) {
      setEditingMovie(movie);
      setValue('title', movie.title);
      setValue('description', movie.description);
      setValue('duration', movie.durationMinutes || movie.duration);
      setValue('posterUrl', movie.posterUrl);
      setValue('categoryId', movie.categoryId);
    } else {
      setEditingMovie(null);
      reset();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMovie(null);
    reset();
  };

  const onSubmit = (data: any) => {
    const payload = {
      title: data.title,
      description: data.description,
      posterUrl: data.posterUrl || undefined,
      durationMinutes: Number(data.duration),
      categoryIds: data.categoryId ? [Number(data.categoryId)] : [],
    };
    if (editingMovie) {
      updateMutation.mutate({ id: editingMovie.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const movies = data?.data || data?.movies || [];
  const categories = categoriesData?.data || categoriesData?.categories || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Películas</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Añadir Película
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1a1a1a' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Duración</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movies.map((movie: any) => (
              <TableRow key={movie.id}>
                <TableCell>{movie.title}</TableCell>
                <TableCell>{movie.durationMinutes || movie.duration} min</TableCell>
                <TableCell>{movie.categories?.map((c: any) => c.name).join(', ') || movie.category?.name || '-'}</TableCell>
                <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {movie.description}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(movie)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => deleteMutation.mutate(movie.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMovie ? 'Editar Película' : 'Añadir Película'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField fullWidth label="Título" margin="normal" {...register('title')} required />
            <TextField fullWidth label="Descripción" margin="normal" multiline rows={3} {...register('description')} required />
            <TextField fullWidth label="Duración (minutos)" type="number" margin="normal" {...register('duration')} required />
            <TextField fullWidth select label="Categoría" margin="normal" {...register('categoryId')} required>
              {categories.map((category: any) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField fullWidth label="URL del Poster" margin="normal" {...register('posterUrl')} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingMovie ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
