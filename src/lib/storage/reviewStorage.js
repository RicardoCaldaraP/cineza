
import { getItem, setItem } from '@/lib/storage/localStorageUtils';
import { getCurrentUser } from '@/lib/storage/userStorage';
import { updateMovieRating } from '@/lib/storage/movieStorage';

export const getReviews = () => {
  return getItem('reviews');
};

export const saveReviews = (reviews) => {
  setItem('reviews', reviews);
};

export const getReviewsByMovie = (movieId) => {
  const reviews = getReviews();
  return reviews.filter(review => review.movieId === movieId);
};

export const getReviewsByUser = (userId) => {
  const reviews = getReviews();
  return reviews.filter(review => review.userId === userId);
};

export const addReview = (review) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const reviews = getReviews();
  const newReview = {
    ...review,
    userId: currentUser.id,
    id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
    date: new Date().toISOString(),
    likes: []
  };
  
  reviews.push(newReview);
  saveReviews(reviews);
  updateMovieRating(review.movieId);
  
  return newReview;
};

export const toggleLikeReview = (reviewId, userId) => {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.id !== userId) return false;

  const reviews = getReviews();
  const reviewIndex = reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) return false;
  
  const review = reviews[reviewIndex];
  const likeIndex = review.likes.indexOf(userId);
  
  if (likeIndex === -1) {
    review.likes.push(userId);
  } else {
    review.likes.splice(likeIndex, 1);
  }
  
  reviews[reviewIndex] = review;
  saveReviews(reviews);
  return true;
};
