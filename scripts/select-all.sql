-- ============================================================
-- Script: select-all.sql
-- Obtiene todos los datos del sistema de reserva de cine
-- ============================================================

-- 1. Usuarios
SELECT id, email, role
FROM users
ORDER BY id;

-- 2. Películas con sus categorías
SELECT m.id, m.title, m.duration_minutes, m.description,
       COALESCE(
         json_agg(json_build_object('id', c.id, 'name', c.name))
         FILTER (WHERE c.id IS NOT NULL),
         '[]'
       ) AS categories
FROM movies m
LEFT JOIN movie_categories mc ON mc.movie_id = m.id
LEFT JOIN categories c ON c.id = mc.category_id
GROUP BY m.id
ORDER BY m.id;

-- 3. Categorías
SELECT id, name
FROM categories
ORDER BY id;

-- 4. Salas con sus asientos
SELECT s.id AS screen_id, s.name AS screen_name, s.total_capacity,
       json_agg(
         json_build_object('id', se.id, 'row', se.row_letter, 'number', se.seat_number)
         ORDER BY se.row_letter, se.seat_number
       ) AS seats
FROM screens s
LEFT JOIN seats se ON se.screen_id = s.id
GROUP BY s.id
ORDER BY s.id;

-- 5. Funciones (showtimes) con película y sala
SELECT st.id AS showtime_id,
       m.title AS movie,
       s.name AS screen,
       st.start_time,
       st.ticket_price,
       s.total_capacity
FROM showtimes st
JOIN movies m ON m.id = st.movie_id
JOIN screens s ON s.id = st.screen_id
ORDER BY st.start_time;

-- 6. Reservas activas con sus asientos
SELECT r.id AS reservation_id,
       u.email AS user_email,
       m.title AS movie,
       s.name AS screen,
       st.start_time,
       r.status,
       r.total_amount,
       r.created_at,
       json_agg(
         json_build_object(
           'seat_id', se.id,
           'row', se.row_letter,
           'number', se.seat_number,
           'price_paid', rs.price_paid
         )
         ORDER BY se.row_letter, se.seat_number
       ) AS seats
FROM reservations r
JOIN users u ON u.id = r.user_id
JOIN showtimes st ON st.id = r.showtime_id
JOIN movies m ON m.id = st.movie_id
JOIN screens s ON s.id = st.screen_id
LEFT JOIN reserved_seats rs ON rs.reservation_id = r.id
LEFT JOIN seats se ON se.id = rs.seat_id
GROUP BY r.id, u.email, m.title, s.name, st.start_time
ORDER BY r.created_at DESC;

-- 7. Reporte: Ingresos por película (reservas activas)
SELECT m.title,
       COUNT(DISTINCT r.id) AS total_reservations,
       COUNT(rs.id) AS tickets_sold,
       SUM(r.total_amount)::numeric(10,2) AS total_revenue
FROM movies m
JOIN showtimes st ON st.movie_id = m.id
JOIN reservations r ON r.showtime_id = st.id AND r.status = 'ACTIVE'
LEFT JOIN reserved_seats rs ON rs.reservation_id = r.id
GROUP BY m.id, m.title
ORDER BY total_revenue DESC;

-- 8. Reporte: Ocupación por función
SELECT st.id AS showtime_id,
       m.title AS movie,
       s.name AS screen,
       st.start_time,
       s.total_capacity AS capacity,
       COUNT(rs.id)::int AS occupied,
       ROUND((COUNT(rs.id)::numeric / s.total_capacity) * 100, 1) AS occupancy_pct,
       COALESCE(SUM(r.total_amount), 0)::numeric(10,2) AS revenue
FROM showtimes st
JOIN movies m ON m.id = st.movie_id
JOIN screens s ON s.id = st.screen_id
LEFT JOIN reservations r ON r.showtime_id = st.id AND r.status = 'ACTIVE'
LEFT JOIN reserved_seats rs ON rs.reservation_id = r.id
GROUP BY st.id, m.title, s.name, s.total_capacity
ORDER BY st.start_time;
