
import { initialMovies, initialUsers, initialReviews } from '@/lib/data';

export const initializeLocalStorage = () => {
  if (!localStorage.getItem('movies')) {
    localStorage.setItem('movies', JSON.stringify(initialMovies));
  }
  
  // Remove user initialization with passwords, Supabase handles auth
  // Keep dummy users for local data association if needed, but without auth logic
  const basicUsers = initialUsers.map(user => ({
    id: user.id, // Keep ID for existing local data relations
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    bio: user.bio,
    following: user.following,
    followers: user.followers,
    watchlist: user.watchlist
  }));

  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(basicUsers));
  }
  
  if (!localStorage.getItem('reviews')) {
    localStorage.setItem('reviews', JSON.stringify(initialReviews));
  }
  
  // currentUser will be managed by AuthContext using Supabase session
  // localStorage 'currentUser' can still be used as a non-authoritative cache
  // if (localStorage.getItem('currentUser') === undefined) {
  //    localStorage.setItem('currentUser', 'null');
  // }
};
