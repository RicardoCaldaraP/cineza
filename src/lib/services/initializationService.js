
import { supabase } from '@/lib/supabaseClient';
import { initialMovies } from '@/lib/data';

const T_MOVIES = 'movies';

export const seedInitialData = async () => {
  try {
    const { data: existingMovies, error: countError } = await supabase
      .from(T_MOVIES)
      .select('id', { count: 'exact', head: true });

    if (countError && countError.code !== '42P01') { 
      console.error('Error checking movies table:', countError.message);
      return;
    }
    
    const movieCount = existingMovies ? existingMovies.length : (await supabase.from(T_MOVIES).select('id', { count: 'exact' })).count;


    if (movieCount === 0) {
      const moviesToInsert = initialMovies.map(({ id, ...movie }) => ({
        ...movie,
        poster: `https://image.tmdb.org/t/p/w500/${movie.poster}` 
      }));

      const { error: seedError } = await supabase.from(T_MOVIES).insert(moviesToInsert);
      if (seedError) {
        console.error('Error seeding movies:', seedError.message);
      } else {
        console.log('Movies seeded successfully.');
      }
    } else {
      console.log('Movies table already contains data. Skipping seed.');
    }
  } catch (error) {
    console.error('Unexpected error during seeding:', error.message);
  }
};

export const initializeAppData = async () => {
  await seedInitialData();
};
