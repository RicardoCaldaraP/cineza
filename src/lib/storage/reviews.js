
import { getFromStorage, saveToStorage } from './utils';
import { getCurrentUser } from './users'; // For associating reviews
import { updateMovieRating } from './movies';

export const getReviews = () => getFromStorage('reviews', []);
export const saveReviews = (reviews) => saveToStorage('reviews', reviews);

export const getReviewsByMovie = (movieId) => {
  const reviews = getReviews();
  return reviews.filter(review => review.movieId === movieId);
};

export const getReviewsByUser = (userId) => {
  const reviews = getReviews();
  return reviews.filter(review => review.userId === userId);
};

export const addReview = (reviewData) => {
  const currentUser = getCurrentUser(); // This now refers to the local cached user
  if (!currentUser) return null; 

  const reviews = getReviews();
  const newReview = {
    ...reviewData,
    userId: currentUser.id, 
    id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
    date: new Date().toISOString(),
    likes: [] // Likes are user IDs from Supabase auth
  };
  
  reviews.push(newReview);
  saveReviews(reviews);
  updateMovieRating(reviewData.movieId);
  return newReview;
};

export const toggleLikeReview = (reviewId, userId) => {
  const currentUser = getCurrentUser();
  // For likes, userId should be the Supabase auth user ID
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
