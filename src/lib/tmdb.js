
const TMDB_API_KEY = '84a758e0a08c2b5d41f038f6a44f593c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const tmdbFetch = async (endpoint, params = {}) => {
  const urlParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'pt-BR',
    ...params,
  });
  const url = `${TMDB_BASE_URL}/${endpoint}?${urlParams}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API Error: ${response.status} for ${url}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(`Network error fetching from TMDB: ${error} for ${url}`);
    return null;
  }
};

export const getPopularMovies = (page = 1) => tmdbFetch('movie/popular', { page });
export const getPopularTVShows = (page = 1) => tmdbFetch('tv/popular', { page });
export const getTrendingAllWeek = (page = 1) => tmdbFetch('trending/all/week', { page });

export const getMovieDetails = (movieId) => tmdbFetch(`movie/${movieId}`, { append_to_response: 'credits,videos,images,recommendations,external_ids' });
export const getTVShowDetails = (tvShowId) => tmdbFetch(`tv/${tvShowId}`, { append_to_response: 'credits,videos,images,recommendations,external_ids' });

export const searchMedia = (query, page = 1, type = 'multi') =>
  tmdbFetch(`search/${type}`, { query, page, include_adult: false });


export const getPosterPath = (path, size = 'w500') => path ? `${TMDB_IMAGE_BASE_URL}${size}${path}` : null;
export const getBackdropPath = (path, size = 'w1280') => path ? `${TMDB_IMAGE_BASE_URL}${size}${path}` : null;
export const getProfilePath = (path, size = 'w185') => path ? `${TMDB_IMAGE_BASE_URL}${size}${path}` : null;

export const formatMediaData = (item) => {
  const media_type = item.media_type || (item.title ? 'movie' : 'tv');
  return {
    id: item.id,
    title: item.title || item.name,
    overview: item.overview,
    poster_path: getPosterPath(item.poster_path),
    backdrop_path: getBackdropPath(item.backdrop_path),
    release_date: item.release_date || item.first_air_date,
    vote_average: item.vote_average,
    media_type: media_type,
  };
};
