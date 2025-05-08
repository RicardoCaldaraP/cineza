
import { getCurrentUser as storageGetCurrentUser, saveCurrentUser as storageSaveCurrentUser } from '@/lib/storage/storageManager';

export const getCurrentUser = () => {
  return storageGetCurrentUser();
};

export const saveCurrentUser = (user) => {
  storageSaveCurrentUser(user);
};
