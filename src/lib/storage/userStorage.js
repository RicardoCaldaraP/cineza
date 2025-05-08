
import { getItem, setItem } from '@/lib/storage/localStorageUtils';

export const getUsers = () => {
  return getItem('users');
};

export const saveUsers = (users) => {
  setItem('users', users);
};

export const getCurrentUser = () => {
  return getItem('currentUser', 'null');
};

export const saveCurrentUser = (user) => {
  setItem('currentUser', user);
};

export const getUser = (id) => {
  const users = getUsers();
  return users.find(user => user.id === id) || null;
};

export const getUserByUsername = (username) => {
  const users = getUsers();
  return users.find(user => user.username === username) || null;
};

export const toggleFollowUser = (followerId, targetUserId) => {
  const currentUser = getCurrentUser();
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
  
  if (currentUser && currentUser.id === followerId) {
    saveCurrentUser(follower);
  }
  
  return true;
};

export const toggleWatchlistMovie = (userId, movieId) => {
  const currentUser = getCurrentUser();
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
  
  if (currentUser && currentUser.id === userId) {
    saveCurrentUser(user);
  }
  return true;
};
