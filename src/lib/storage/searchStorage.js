
import { getMovies } from '@/lib/storage/movieStorage';
import { getUsers } from '@/lib/storage/userStorage';

export const searchMovies = (query) => {
  if (!query) return [];
  
  const movies = getMovies();
  const lowerQuery = query.toLowerCase();
  
  return movies.filter(movie => 
    movie.title.toLowerCase().includes(lowerQuery) || 
    movie.director.toLowerCase().includes(lowerQuery) ||
    movie.genre.toLowerCase().includes(lowerQuery)
  );
};

export const searchUsers = (query) => {
  if (!query) return [];
  
  const users = getUsers();
  const lowerQuery = query.toLowerCase();
  
  return users.filter(user => 
    user.username.toLowerCase().includes(lowerQuery) || 
    user.name.toLowerCase().includes(lowerQuery)
  );
};
