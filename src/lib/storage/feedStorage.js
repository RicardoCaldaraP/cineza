
import { getUser } from '@/lib/storage/userStorage';
import { getReviews } from '@/lib/storage/reviewStorage';

export const getFeedForUser = (userId) => {
  const currentUser = getUser(userId);
  const reviews = getReviews();
  
  if (!currentUser) return [];
  
  return reviews
    .filter(review => currentUser.following.includes(review.userId) || review.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};
