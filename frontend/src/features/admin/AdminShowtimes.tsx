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
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '@/lib/api';

export function AdminShowtimes() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminShowtimes'],
    queryFn: async () => {
      const response = await api.get('/showtimes');
      return response.data;
    },
  });

  const { data: moviesData } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const response = await api.get('/movies');
      return response.data;
    },
  });

  const { data: screensData } = useQuery({
    queryKey: ['screens'],
    queryFn: async () => {
      const response = await api.get('/screens');
      return response.data;
    },
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/showtimes', data);
    },
    onSuccess: () => {
      toast.success('Función creada');
      queryClient.invalidateQueries({ queryKey: ['adminShowtimes'] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: any) => {
      await api.put(`/showtimes/${id}`, data);
    },
    onSuccess: () => {
      toast.success('Función actualizada');
      queryClient.invalidateQueries({ queryKey: ['adminShowtimes'] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/showtimes/${id}`);
    },
    onSuccess: () => {
      toast.success('Función eliminada');
      queryClient.invalidateQueries({ queryKey: ['adminShowtimes'] });
    },
  });

  const handleOpen = (showtime?: any) => {
    if (showtime) {
      setEditingShowtime(showtime);
      setValue('movieId', showtime.movieId);
      setValue('screenId', showtime.screenId);
      setValue('startTime', format(new Date(showtime.startTime), "yyyy-MM-dd'T'HH:mm"));
      setValue('price', showtime.price);
    } else {
      setEditingShowtime(null);
      reset();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingShowtime(null);
    reset();
  };

  const onSubmit = (data: any) => {
    const payload = {
      movieId: Number(data.movieId),
      screenId: Number(data.screenId),
      startTime: data.startTime ? new Date(data.startTime).toISOString() : data.startTime,
      ticketPrice: Number(data.price || data.ticketPrice),
    };
    if (editingShowtime) {
      updateMutation.mutate({ id: editingShowtime.id, data: payload });
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

  const showtimes = data?.data || data?.showtimes || [];
  const movies = moviesData?.movies || [];
  const screens = screensData?.screens || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Funciones</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Añadir Función
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1a1a1a' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Película</TableCell>
              <TableCell>Sala</TableCell>
              <TableCell>Fecha y Hora</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {showtimes.map((showtime: any) => (
              <TableRow key={showtime.id}>
                <TableCell>{showtime.movie?.title}</TableCell>
                <TableCell>{showtime.screen?.name}</TableCell>
                <TableCell>{format(new Date(showtime.startTime), "dd/MM/yyyy HH:mm")}</TableCell>
                <TableCell>${showtime.ticketPrice || showtime.price}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(showtime)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => deleteMutation.mutate(showtime.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingShowtime ? 'Editar Función' : 'Añadir Función'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField fullWidth select label="Película" margin="normal" {...register('movieId')} required>
              {movies.map((movie: any) => (
                <MenuItem key={movie.id} value={movie.id}>
                  {movie.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField fullWidth select label="Sala" margin="normal" {...register('screenId')} required>
              {screens.map((screen: any) => (
                <MenuItem key={screen.id} value={screen.id}>
                  {screen.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField fullWidth label="Fecha y Hora" type="datetime-local" margin="normal" {...register('startTime')} required InputLabelProps={{ shrink: true }} />
            <TextField fullWidth label="Precio" type="number" margin="normal" {...register('price')} required />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingShowtime ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
