
import { supabase } from '@/lib/supabaseClient';

const T_MOVIES = 'movies';

export const getMovies = async (limit = 10, offset = 0) => {
  const effectiveLimit = Math.max(0, limit); 
  const rangeEnd = effectiveLimit > 0 ? offset + effectiveLimit - 1 : offset;

  const { data, error, count } = await supabase
    .from(T_MOVIES)
    .select('*', { count: 'exact' })
    .order('average_rating', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, rangeEnd);

  if (error) {
    console.error('Error fetching movies:', error.message, 'Limit:', effectiveLimit, 'Offset:', offset, 'RangeEnd:', rangeEnd);
    if (error.code === 'PGRST103') {
        console.error('Range not satisfiable. This likely means limit is too small or zero when offset is positive.');
    }
    return { data: [], count: 0 };
  }
  return { data: data || [], count: count || 0 };
};

export const getMovieById = async (id) => {
  if (!id) return null;
  const { data, error } = await supabase
    .from(T_MOVIES)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching movie by ID:', error.message);
    return null;
  }
  return data;
};

export const searchMovies = async (query, limit = 10, offset = 0) => {
  if (!query) return getMovies(limit, offset);

  const effectiveLimit = Math.max(0, limit);
  const rangeEnd = effectiveLimit > 0 ? offset + effectiveLimit - 1 : offset;
  
  const { data, error, count } = await supabase
    .from(T_MOVIES)
    .select('*', { count: 'exact' })
    .or(`title.ilike.%${query}%,director.ilike.%${query}%,genre.ilike.%${query}%`)
    .order('average_rating', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, rangeEnd);
    
  if (error) {
    console.error('Error searching movies:', error.message, 'Query:', query, 'Limit:', effectiveLimit, 'Offset:', offset, 'RangeEnd:', rangeEnd);
     if (error.code === 'PGRST103') {
        console.error('Range not satisfiable during search. This likely means limit is too small or zero when offset is positive.');
    }
    return { data: [], count: 0 };
  }
  return { data: data || [], count: count || 0 };
};

export const getMoviesByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const { data, error } = await supabase
    .from(T_MOVIES)
    .select('*')
    .in('id', ids);

  if (error) {
    console.error('Error fetching movies by IDs:', error.message);
    return [];
  }
  return data || [];
};
