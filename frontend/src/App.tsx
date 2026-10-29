import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { HomePage } from './features/movies/HomePage'
import { MovieDetailPage } from './features/movies/MovieDetailPage'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { SeatSelectionPage } from './features/seats/SeatSelectionPage'
import { MyReservationsPage } from './features/reservations/MyReservationsPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { GuestRoute } from './routes/GuestRoute'
import { AdminRoute } from './routes/AdminRoute'
import { AdminLayout } from './components/layout/AdminLayout'
import { AdminDashboard } from './features/admin/AdminDashboard'
import { AdminMovies } from './features/admin/AdminMovies'
import { AdminCategories } from './features/admin/AdminCategories'
import { AdminScreens } from './features/admin/AdminScreens'
import { AdminShowtimes } from './features/admin/AdminShowtimes'
import { AdminReservations } from './features/admin/AdminReservations'
import { AdminReports } from './features/admin/AdminReports'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/showtimes/:id/seats" element={<SeatSelectionPage />} />
        
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route path="/reservations" element={<MyReservationsPage />} />
        </Route>
      </Route>
      
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="screens" element={<AdminScreens />} />
          <Route path="showtimes" element={<AdminShowtimes />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
