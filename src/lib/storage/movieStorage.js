
import { getItem, setItem } from '@/lib/storage/localStorageUtils';
import { getReviewsByMovie } from '@/lib/storage/reviewStorage';

export const getMovies = () => {
  return getItem('movies');
};

export const saveMovies = (movies) => {
  setItem('movies', movies);
};

export const getMovie = (id) => {
  const movies = getMovies();
  return movies.find(movie => movie.id === id) || null;
};

export const updateMovieRating = (movieId) => {
  const movies = getMovies();
  const reviews = getReviewsByMovie(movieId);
  
  const movieIndex = movies.findIndex(m => m.id === movieId);
  if (movieIndex === -1) return;
  
  const movie = movies[movieIndex];
  
  if (reviews.length === 0) {
    movie.averageRating = 0;
  } else {
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    movie.averageRating = parseFloat((sum / reviews.length).toFixed(1)); 
  }
  
  movies[movieIndex] = movie;
  saveMovies(movies);
};
