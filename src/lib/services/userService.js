
import { supabase } from '@/lib/supabaseClient';

const T_PROFILES = 'profiles';
const AVATARS_BUCKET = 'avatars';

const isSupabaseConfigured = () => {
  return supabase && supabase.supabaseUrl && supabase.supabaseKey;
};

const getAuthUser = async () => {
  if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.');
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting authenticated user:', error.message);
    throw error;
  }
  if (!user) {
    throw new Error('Usuário não autenticado.');
  }
  return user;
};

const fetchProfileData = async (key, value) => {
  if (!isSupabaseConfigured()) return null;
  if (!key || !value) return null;
  try {
    const { data, error } = await supabase
      .from(T_PROFILES)
      .select(`
        *,
        followers_count:profiles_followers_id_fkey(count),
        following_count:profiles_following_id_fkey(count)
      `)
      .eq(key, value)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null; 
      throw error;
    }

    const { data: actualFollowersData, error: followersError } = await supabase
      .from(T_PROFILES)
      .select('followers')
      .eq('id', data.id)
      .single();

    const { data: actualFollowingData, error: followingError } = await supabase
      .from(T_PROFILES)
      .select('following')
      .eq('id', data.id)
      .single();
      
    return {
      ...data,
      followers: followersError ? [] : actualFollowersData?.followers || [],
      following: followingError ? [] : actualFollowingData?.following || [],
    };
  } catch (error) {
    console.error(`UserService (fetchProfileData by ${key} = ${value}):`, error.message);
    return null;
  }
};

export const getCurrentUserProfile = async () => {
  if (!isSupabaseConfigured()) return null;
  try {
    const authUser = await getAuthUser();
    return await fetchProfileData('id', authUser.id);
  } catch (error) {
    console.error('UserService (getCurrentUserProfile wrapper):', error.message);
    return null; 
  }
};

export const getUserProfileById = async (userId) => {
  if (!isSupabaseConfigured()) return null;
  return await fetchProfileData('id', userId);
};

export const getUserProfileByUsername = async (username) => {
  if (!isSupabaseConfigured()) return null;
  return await fetchProfileData('username', username);
};

export const getAllUsers = async (limit = 10, offset = 0) => {
  if (!isSupabaseConfigured()) return { data: [], count: 0 };
  try {
    const effectiveLimit = Math.max(0, limit);
    const rangeEnd = effectiveLimit > 0 ? offset + effectiveLimit - 1 : offset;

    const { data, error, count } = await supabase
      .from(T_PROFILES)
      .select('*', { count: 'exact' })
      .order('name', { ascending: true, nullsFirst: false })
      .range(offset, rangeEnd);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error('UserService (getAllUsers):', error.message);
    return { data: [], count: 0 };
  }
};

export const searchUsers = async (query, limit = 10, offset = 0) => {
  if (!isSupabaseConfigured()) return { data: [], count: 0 };
  if (!query) return getAllUsers(limit, offset);
  try {
    const effectiveLimit = Math.max(0, limit);
    const rangeEnd = effectiveLimit > 0 ? offset + effectiveLimit - 1 : offset;

    const { data, error, count } = await supabase
      .from(T_PROFILES)
      .select('*', { count: 'exact' })
      .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
      .order('name', { ascending: true, nullsFirst: false })
      .range(offset, rangeEnd);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error('UserService (searchUsers):', error.message);
    return { data: [], count: 0 };
  }
};

export const toggleFollowUser = async (targetUserId) => {
  if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.');
  try {
    const authUser = await getAuthUser();
    if (authUser.id === targetUserId) throw new Error('Não é possível seguir a si mesmo.');

    const currentUserProfile = await getUserProfileById(authUser.id);
    if (!currentUserProfile) throw new Error('Perfil do usuário atual não encontrado.');
    
    const targetUserProfile = await getUserProfileById(targetUserId);
    if (!targetUserProfile) throw new Error('Perfil do usuário alvo não encontrado.');

    const isCurrentlyFollowing = currentUserProfile.following?.includes(targetUserId);

    const newCurrentUserFollowing = isCurrentlyFollowing
      ? currentUserProfile.following.filter(id => id !== targetUserId)
      : [...(currentUserProfile.following || []), targetUserId];

    const { error: currentUserError } = await supabase
      .from(T_PROFILES)
      .update({ following: newCurrentUserFollowing })
      .eq('id', authUser.id);
    if (currentUserError) throw currentUserError;

    const newTargetUserFollowers = isCurrentlyFollowing
      ? targetUserProfile.followers?.filter(id => id !== authUser.id)
      : [...(targetUserProfile.followers || []), authUser.id];

    const { error: targetUserError } = await supabase
      .from(T_PROFILES)
      .update({ followers: newTargetUserFollowers })
      .eq('id', targetUserId);

    if (targetUserError) {
      await supabase.from(T_PROFILES).update({ following: currentUserProfile.following }).eq('id', authUser.id);
      throw targetUserError;
    }
    return { isFollowing: !isCurrentlyFollowing };
  } catch (error) {
    console.error('UserService (toggleFollowUser):', error.message);
    throw error;
  }
};

export const toggleWatchlistMovie = async (movieId) => {
  if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.');
  try {
    const authUser = await getAuthUser();
    const currentUserProfile = await getUserProfileById(authUser.id);
    if (!currentUserProfile) throw new Error('Perfil do usuário atual não encontrado.');

    const currentWatchlist = currentUserProfile.watchlist || [];
    const isMovieInWatchlist = currentWatchlist.includes(movieId);
    const updatedWatchlist = isMovieInWatchlist
      ? currentWatchlist.filter(id => id !== movieId)
      : [...currentWatchlist, movieId];

    const { data, error } = await supabase
      .from(T_PROFILES)
      .update({ watchlist: updatedWatchlist })
      .eq('id', authUser.id)
      .select('watchlist')
      .single();
    if (error) throw error;
    return data.watchlist;
  } catch (error) {
    console.error('UserService (toggleWatchlistMovie):', error.message);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.');
  if (!userId) throw new Error('ID do usuário é obrigatório.');
  try {
    const { data, error } = await supabase
      .from(T_PROFILES)
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('UserService (updateUserProfile):', error.message);
    throw error;
  }
};

const removeOldAvatars = async (userId) => {
  if (!isSupabaseConfigured()) return;
  try {
    const { data: existingFiles, error: listError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .list(userId, { limit: 100, search: `${userId}_` }); 

    if (listError) {
      console.warn('UserService: Could not list existing avatars:', listError.message);
      return;
    }
    if (existingFiles && existingFiles.length > 0) {
      const filesToRemove = existingFiles.map(f => `${userId}/${f.name}`);
      if (filesToRemove.length > 0) {
        const { error: removeError } = await supabase.storage.from(AVATARS_BUCKET).remove(filesToRemove);
        if (removeError) console.warn('UserService: Could not remove old avatar(s):', removeError.message);
      }
    }
  } catch(error) {
    console.warn('UserService: Error in removeOldAvatars:', error.message);
  }
};

export const uploadAvatar = async (userId, file) => {
  if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.');
  if (!file) throw new Error("Nenhum arquivo fornecido para upload.");
  if (!userId) throw new Error("ID do usuário é obrigatório para upload.");

  try {
    await removeOldAvatars(userId);
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const newFileName = `${userId}_${Date.now()}.${fileExt}`; 
    const filePath = `${userId}/${newFileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from(AVATARS_BUCKET)
      .upload(filePath, file, { cacheControl: '3600', upsert: false });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(filePath);
    if (!publicUrlData?.publicUrl) throw new Error('Erro ao obter URL pública do avatar.');
    
    return `${publicUrlData.publicUrl}?t=${new Date().getTime()}`;
  } catch (error) {
    console.error('UserService (uploadAvatar):', error.message);
    throw error;
  }
};

export const createTestUser = async (email, password, username, name) => {
  if (!isSupabaseConfigured()) throw new Error('Supabase não configurado.');
  try {
    console.log(`Attempting to create test user: ${email}`);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          name: name,
          avatar_url: `https://avatar.vercel.sh/${username}.png`
        },
      },
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        console.warn(`Test user ${email} already exists.`);
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          console.error(`Error signing in existing test user ${email}:`, signInError.message);
          throw signInError;
        }
        console.log(`Successfully signed in existing test user ${email}. User ID: ${signInData.user?.id}`);
        return { user: signInData.user, session: signInData.session, message: "Usuário de teste já existe. Login efetuado." };
      }
      console.error(`Error creating test user ${email}:`, error.message);
      throw error;
    }
    
    if (data.user && data.session) {
       console.log(`Test user ${email} created successfully. User ID: ${data.user.id}`);
    } else if (data.user && !data.session) {
      console.log(`Test user ${email} created but requires email confirmation. User ID: ${data.user.id}`);
    }

    return data;
  } catch (error) {
    console.error('UserService (createTestUser final catch):', error.message);
    throw error;
  }
};
