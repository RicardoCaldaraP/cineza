
import { supabase } from '@/lib/supabaseClient';

const T_REVIEWS = 'reviews';

export const getReviewsByMovieId = async (movieId, limit = 10, offset = 0) => {
  if (!movieId) return { data: [], count: 0 };
  const { data, error, count } = await supabase
    .from(T_REVIEWS)
    .select('*, profiles (id, username, name, avatar_url)', { count: 'exact' })
    .eq('movie_id', movieId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching reviews by movie ID:', error.message);
    return { data: [], count: 0 };
  }
  return { data: data || [], count: count || 0 };
};

export const getReviewsByUserId = async (userId, limit = 10, offset = 0) => {
  if (!userId) return { data: [], count: 0 };
  const { data, error, count } = await supabase
    .from(T_REVIEWS)
    .select('*, movies (*), profiles!inner(id, username, name, avatar_url)', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching reviews by user ID:', error.message);
    return { data: [], count: 0 };
  }
  return { data: data || [], count: count || 0 };
};

export const addReview = async (reviewData) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated to add review.');

  const newReview = {
    ...reviewData,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from(T_REVIEWS)
    .insert(newReview)
    .select('*, profiles (id, username, name, avatar_url), movies (*)')
    .single();

  if (error) {
    console.error('Error adding review:', error.message);
    throw error;
  }
  return data;
};

export const toggleLikeReview = async (reviewId) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated to like review.');

  const { data: review, error: fetchError } = await supabase
    .from(T_REVIEWS)
    .select('likes')
    .eq('id', reviewId)
    .single();

  if (fetchError || !review) {
    console.error('Error fetching review for like:', fetchError?.message);
    throw fetchError || new Error('Review not found.');
  }

  const currentLikes = review.likes || [];
  const userIdString = String(user.id); 
  let updatedLikes;

  if (currentLikes.includes(userIdString)) {
    updatedLikes = currentLikes.filter(id => id !== userIdString);
  } else {
    updatedLikes = [...currentLikes, userIdString];
  }

  const { data: updatedReview, error: updateError } = await supabase
    .from(T_REVIEWS)
    .update({ likes: updatedLikes })
    .eq('id', reviewId)
    .select('likes')
    .single();

  if (updateError) {
    console.error('Error toggling like:', updateError.message);
    throw updateError;
  }
  return updatedReview;
};

export const getFeedReviews = async (userId, limit = 10, offset = 0) => {
  if (!userId) return { data: [], count: 0 };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('following')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching user profile for feed:', profileError?.message);
    return { data: [], count: 0 };
  }

  const followedUserIds = profile.following || [];
  const userIdsForFeed = [...followedUserIds, userId]; 

  const { data, error, count } = await supabase
    .from(T_REVIEWS)
    .select('*, profiles (id, username, name, avatar_url), movies (*)', { count: 'exact' })
    .in('user_id', userIdsForFeed)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching feed reviews:', error.message);
    return { data: [], count: 0 };
  }
  return { data: data || [], count: count || 0 };
};
