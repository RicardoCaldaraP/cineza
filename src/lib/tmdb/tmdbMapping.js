
import { fetchFromTMDB } from '@/lib/tmdb/tmdbApi';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

let genreMapMovie = null;
let genreMapTV = null;
let genreMapsInitialized = false;
let genreMapsPromise = null;

const _getGenresTMDBInternal = async (mediaType = 'movie') => {
  const endpoint = `genre/${mediaType}/list`;
  const data = await fetchFromTMDB(endpoint);
  const newMap = {};
  data.genres.forEach(genre => {
    newMap[genre.id] = genre.name;
  });

  if (mediaType === 'movie') {
    genreMapMovie = newMap;
  } else {
    genreMapTV = newMap;
  }
  return data.genres;
};

export const initializeGenreMaps = async () => {
  if (genreMapsInitialized) return;
  if (genreMapsPromise) return genreMapsPromise;

  genreMapsPromise = Promise.all([
    _getGenresTMDBInternal('movie'),
    _getGenresTMDBInternal('tv')
  ]).then(() => {
    genreMapsInitialized = true;
    genreMapsPromise = null; 
  }).catch(error => {
    console.error("Failed to initialize genre maps:", error);
    genreMapsPromise = null; 
    throw error; 
  });
  return genreMapsPromise;
};

export const getGenreNames = (genreIds, mediaType) => {
  if (!genreMapsInitialized) {
    console.warn("Genre maps not initialized yet. Call initializeGenreMaps first or ensure it has completed.");
    return 'Gêneros indisponíveis';
  }
  if (!genreIds || genreIds.length === 0) return 'Desconhecido';
  const map = mediaType === 'movie' ? genreMapMovie : genreMapTV;
  if (!map) return 'Carregando gêneros...';
  return genreIds.map(id => map[id] || 'Desconhecido').join(', ');
};

export const mapTMDBToCinezaMovie = (tmdbItem, mediaTypeParam) => {
  if (!tmdbItem || typeof tmdbItem.id !== 'number') {
    console.warn("mapTMDBToCinezaMovie: Item TMDB inválido ou sem ID.", tmdbItem);
    return {
      tmdb_id: null,
      title: "Título Indisponível",
      description: 'Sem descrição disponível.',
      poster_url: null,
      backdrop_url: null,
      release_date: null,
      year: 0,
      genre_ids: [],
      genre: "Desconhecido",
      vote_average_tmdb: 0,
      vote_count_tmdb: 0,
      media_type: mediaTypeParam || 'movie',
      director: null, 
      creators: null,
      popularity: 0,
    };
  }

  const isMovie = mediaTypeParam ? mediaTypeParam === 'movie' : (tmdbItem.title !== undefined || tmdbItem.media_type === 'movie');
  const currentMediaType = tmdbItem.media_type || (isMovie ? 'movie' : 'tv');
  
  let titleValue = isMovie ? tmdbItem.title : tmdbItem.name;
  if (typeof titleValue !== 'string' || titleValue.trim() === '') {
    titleValue = "Título Indisponível";
  } else {
    titleValue = titleValue.trim();
  }

  return {
    tmdb_id: tmdbItem.id,
    title: titleValue,
    description: tmdbItem.overview || 'Sem descrição disponível.',
    poster_url: tmdbItem.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbItem.poster_path}` : null,
    backdrop_url: tmdbItem.backdrop_path ? `${TMDB_BACKDROP_IMAGE_BASE_URL}${tmdbItem.backdrop_path}` : null,
    release_date: isMovie ? tmdbItem.release_date : tmdbItem.first_air_date,
    year: parseInt((isMovie ? tmdbItem.release_date : tmdbItem.first_air_date)?.split('-')[0] || 0, 10),
    genre_ids: tmdbItem.genre_ids || (tmdbItem.genres ? tmdbItem.genres.map(g => g.id) : []),
    genre: genreMapsInitialized ? getGenreNames(tmdbItem.genre_ids || (tmdbItem.genres ? tmdbItem.genres.map(g => g.id) : []), currentMediaType) : "Carregando...",
    vote_average_tmdb: tmdbItem.vote_average || 0,
    vote_count_tmdb: tmdbItem.vote_count || 0,
    media_type: currentMediaType,
    director: tmdbItem.director, 
    creators: tmdbItem.creators,
    popularity: tmdbItem.popularity || 0,
  };
};

export const getGenresTMDB = async (mediaType = 'movie') => {
  await initializeGenreMaps(); 
  const map = mediaType === 'movie' ? genreMapMovie : genreMapTV;
  if (!map) return []; 
  return Object.entries(map).map(([id, name]) => ({ id: parseInt(id, 10), name }));
};
