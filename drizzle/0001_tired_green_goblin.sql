CREATE INDEX "idx_movies_title" ON "movies" USING btree ("title");--> statement-breakpoint
CREATE INDEX "idx_reservations_user_id" ON "reservations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reservations_showtime_id" ON "reservations" USING btree ("showtime_id");--> statement-breakpoint
CREATE INDEX "idx_showtimes_movie_id" ON "showtimes" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "idx_showtimes_screen_id" ON "showtimes" USING btree ("screen_id");--> statement-breakpoint
CREATE INDEX "idx_showtimes_start_time" ON "showtimes" USING btree ("start_time");