
import { getFromStorage, saveToStorage } from './utils';

// These functions now primarily interact with the local cache of users
// which might be useful for displaying user info quickly or for features
// not yet migrated to Supabase profiles.
export const getUsers = () => getFromStorage('users', []);
export const saveUsers = (users) => saveToStorage('users', users);

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing current user from localStorage", error);
    return null;
  }
};

export const saveCurrentUser = (user) => {
  if (user === null) {
    localStorage.setItem('currentUser', 'null');
  } else {
    // Ensure we are saving a serializable version, Supabase user object can be complex
    const minimalUser = {
      id: user.id,
      email: user.email,
      username: user.username || user.user_metadata?.username,
      name: user.name || user.user_metadata?.name,
      avatar: user.avatar || user.user_metadata?.avatar_url,
      bio: user.bio || '',
      // Keep these local until migrated fully
      following: user.following || [],
      followers: user.followers || [],
      watchlist: user.watchlist || [],
    };
    localStorage.setItem('currentUser', JSON.stringify(minimalUser));
  }
};

export const getUser = (id) => {
  const users = getUsers(); // Gets from local storage 'users'
  return users.find(user => user.id === id) || null;
};

export const getUserByUsername = (username) => {
  const users = getUsers(); // Gets from local storage 'users'
  return users.find(user => user.username === username) || null;
};

// Functions like toggleFollowUser and toggleWatchlistMovie will continue to operate
// on the local storage 'users' and 'currentUser' cache.
// These would need to be refactored to use Supabase tables if user relationships
// and watchlists are moved to the backend.

export const toggleFollowUser = (followerId, targetUserId) => {
   const currentUser = getCurrentUser(); // Local cache
   if (!currentUser || currentUser.id !== followerId) return false;

  const users = getUsers();
  const followerIndex = users.findIndex(u => u.id === followerId);
  const targetIndex = users.findIndex(u => u.id === targetUserId);
  
  if (followerIndex === -1 || targetIndex === -1 || followerId === targetUserId) return false;
  
  const follower = users[followerIndex];
  const target = users[targetIndex];
  
  const isFollowing = follower.following.includes(targetUserId);
  
  if (isFollowing) {
    follower.following = follower.following.filter(id => id !== targetUserId);
    target.followers = target.followers.filter(id => id !== followerId);
  } else {
    follower.following.push(targetUserId);
    target.followers.push(followerId);
  }
  
  users[followerIndex] = follower;
  users[targetIndex] = target;
  saveUsers(users);
  
  if (currentUser.id === followerId) {
    saveCurrentUser(follower); // Update local cache of current user
  }
  return true;
};

export const toggleWatchlistMovie = (userId, movieId) => {
  const currentUser = getCurrentUser(); // Local cache
  if (!currentUser || currentUser.id !== userId) return false;

  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return false;
  
  const user = users[userIndex];
  const isInWatchlist = user.watchlist.includes(movieId);
  
  if (isInWatchlist) {
    user.watchlist = user.watchlist.filter(id => id !== movieId);
  } else {
    user.watchlist.push(movieId);
  }
  
  users[userIndex] = user;
  saveUsers(users);
  
  if (currentUser.id === userId) {
    saveCurrentUser(user); // Update local cache
  }
  return true;
};

export const searchUsers = (query) => {
  if (!query) return [];
  const users = getUsers(); // Local cache
  const lowerQuery = query.toLowerCase();
  return users.filter(user => 
    user.username.toLowerCase().includes(lowerQuery) || 
    (user.name && user.name.toLowerCase().includes(lowerQuery))
  );
};
