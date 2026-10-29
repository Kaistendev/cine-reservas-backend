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
} from '@mui/material';
import { Edit, Delete, Add, EventSeat } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import api from '@/lib/api';

export function AdminScreens() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminScreens'],
    queryFn: async () => {
      const response = await api.get('/screens');
      return response.data;
    },
  });

  const { register, handleSubmit, reset, setValue } = useForm();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/screens', data);
    },
    onSuccess: () => {
      toast.success('Sala creada');
      queryClient.invalidateQueries({ queryKey: ['adminScreens'] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: any) => {
      await api.put(`/screens/${id}`, data);
    },
    onSuccess: () => {
      toast.success('Sala actualizada');
      queryClient.invalidateQueries({ queryKey: ['adminScreens'] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/screens/${id}`);
    },
    onSuccess: () => {
      toast.success('Sala eliminada');
      queryClient.invalidateQueries({ queryKey: ['adminScreens'] });
    },
  });

  const generateSeatsMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/screens/${id}/seats`);
    },
    onSuccess: () => {
      toast.success('Butacas generadas');
    },
  });

  const handleOpen = (screen?: any) => {
    if (screen) {
      setEditingScreen(screen);
      setValue('name', screen.name);
      setValue('rows', screen.rows);
      setValue('columns', screen.columns);
    } else {
      setEditingScreen(null);
      reset();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingScreen(null);
    reset();
  };

  const onSubmit = (data: any) => {
    const payload = {
      name: data.name,
      totalCapacity: Number(data.totalCapacity || data.rows * data.columns || 0),
    };
    if (editingScreen) {
      updateMutation.mutate({ id: editingScreen.id, data: payload });
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

  const screens = Array.isArray(data) ? data : (data?.screens || data?.data || []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Salas</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Añadir Sala
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#1a1a1a' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Filas</TableCell>
              <TableCell>Columnas</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {screens.map((screen: any) => (
              <TableRow key={screen.id}>
                <TableCell>{screen.name}</TableCell>
                <TableCell>{screen.rows}</TableCell>
                <TableCell>{screen.columns}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => generateSeatsMutation.mutate(screen.id)} title="Generar Butacas">
                    <EventSeat />
                  </IconButton>
                  <IconButton onClick={() => handleOpen(screen)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => deleteMutation.mutate(screen.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingScreen ? 'Editar Sala' : 'Añadir Sala'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField fullWidth label="Nombre" margin="normal" {...register('name')} required />
            <TextField fullWidth label="Capacidad Total" type="number" margin="normal" {...register('totalCapacity')} required />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingScreen ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
