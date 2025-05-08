
import { getReviews } from './reviews';
import { getUser } from './users'; // Operates on local cache

export const getFeedForUser = (userId) => {
  const currentUserData = getUser(userId); // From local cache
  const reviews = getReviews(); // From local storage
  
  if (!currentUserData) return [];
  
  // Filter reviews based on who the cached currentUser follows, or their own reviews
  return reviews.filter(review => 
    currentUserData.following.includes(review.userId) || review.userId === userId
  ).sort((a, b) => new Date(b.date) - new Date(a.date));
};
