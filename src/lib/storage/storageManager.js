
// This file manages the direct interaction with localStorage

export const getUsers = () => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const saveUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const getReviews = () => {
  return JSON.parse(localStorage.getItem('reviews') || '[]');
};

export const saveReviews = (reviews) => {
  localStorage.setItem('reviews', JSON.stringify(reviews));
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('currentUser');
    return user && user !== 'null' ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error parsing current user from localStorage", error);
    localStorage.setItem('currentUser', 'null');
    return null;
  }
};

export const saveCurrentUser = (user) => {
  if (user === null) {
    localStorage.setItem('currentUser', 'null');
  } else {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
};
