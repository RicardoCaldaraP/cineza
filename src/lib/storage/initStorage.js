
import { initialMovies, initialUsers, initialReviews } from '@/lib/data';
import { getItem, setItem, getStringItem, setStringItem } from '@/lib/storage/localStorageUtils';

export const initializeStorage = () => {
  if (getStringItem('movies') === null) {
    setItem('movies', initialMovies);
  }
  
  if (getStringItem('users') === null) {
    const usersWithPasswords = initialUsers.map((user, index) => ({
      ...user,
      password: `password${index + 1}` 
    }));
    setItem('users', usersWithPasswords);
  }
  
  if (getStringItem('reviews') === null) {
    setItem('reviews', initialReviews);
  }
  
  if (getStringItem('currentUser') === null) { 
     setItem('currentUser', null);
  }
};
