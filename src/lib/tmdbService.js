
import { supabase } from '@/lib/supabaseClient';

const TMDB_API_KEY = '84a758e0a08c2b5d41f038f6a44f593c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

let genreMapMovie = {};
let genreMapTV = {};
let genresPromiseMovie = null;
let genresPromiseTV = null;

const fetchFromTMDB = async (endpoint, params = {}) => {
  const urlParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'pt-BR',
    ...params,
  });
  const url = `${TMDB_BASE_URL}/${endpoint}?${urlParams}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB API Error for ${url}: ${response.status} ${response.statusText}`);
      const errorData = await response.json().catch(() => ({ message: `TMDB API Error: ${response.status} ${response.statusText}` }));
      throw new Error(errorData.message || `TMDB API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from TMDB endpoint ${endpoint}:`, error);
    throw error; 
  }
};

const getGenreNamesByIds = (genreIds, mediaType) => {
  if (!genreIds || genreIds.length === 0) return 'Desconhecido';
  const map = mediaType === 'movie' ? genreMapMovie : genreMapTV;
  if (Object.keys(map).length === 0) {
    console.warn(`Genre map for ${mediaType} not loaded yet. Returning raw IDs.`);
    return genreIds.join(', ');
  }
  return genreIds.map(id => map[id] || 'Desconhecido').join(', ');
};

const mapTMDBToCinezaMovie = (tmdbItem, mediaTypeParam) => {
  const isMovie = mediaTypeParam ? mediaTypeParam === 'movie' : (tmdbItem.title !== undefined || tmdbItem.media_type === 'movie');
  const currentMediaType = tmdbItem.media_type || (isMovie ? 'movie' : 'tv');

  return {
    tmdb_id: tmdbItem.id,
    title: isMovie ? tmdbItem.title : tmdbItem.name,
    description: tmdbItem.overview || 'Sem descrição disponível.',
    poster_url: tmdbItem.poster_path ? `${TMDB_IMAGE_BASE_URL}${tmdbItem.poster_path}` : null,
    backdrop_url: tmdbItem.backdrop_path ? `${TMDB_BACKDROP_IMAGE_BASE_URL}${tmdbItem.backdrop_path}` : null,
    release_date: isMovie ? tmdbItem.release_date : tmdbItem.first_air_date,
    year: parseInt((isMovie ? tmdbItem.release_date : tmdbItem.first_air_date)?.split('-')[0] || 0, 10) || null,
    genre_ids: tmdbItem.genre_ids || [], 
    genre: getGenreNamesByIds(tmdbItem.genre_ids || [], currentMediaType),
    vote_average_tmdb: tmdbItem.vote_average || 0,
    vote_count_tmdb: tmdbItem.vote_count || 0,
    media_type: currentMediaType,
    director: tmdbItem.director, 
    creators: tmdbItem.creators,
    popularity: tmdbItem.popularity || 0,
    runtime: tmdbItem.runtime,
    episode_run_time: tmdbItem.episode_run_time,
    number_of_seasons: tmdbItem.number_of_seasons,
    number_of_episodes: tmdbItem.number_of_episodes,
    status: tmdbItem.status,
    original_language: tmdbItem.original_language,
    budget: tmdbItem.budget,
    revenue: tmdbItem.revenue,
    production_companies: tmdbItem.production_companies,
    networks: tmdbItem.networks,
    credits: tmdbItem.credits,
    recommendations: tmdbItem.recommendations,
  };
};

export const getGenresTMDB = async (mediaType = 'movie') => {
  const relevantPromise = mediaType === 'movie' ? genresPromiseMovie : genresPromiseTV;
  const relevantMap = mediaType === 'movie' ? genreMapMovie : genreMapTV;

  if (Object.keys(relevantMap).length > 0) {
    return Object.values(relevantMap).map(name => ({ id: parseInt(Object.keys(relevantMap).find(key => relevantMap[key] === name)), name }));
  }
  if (relevantPromise) {
    await relevantPromise;
    return Object.values(relevantMap).map(name => ({ id: parseInt(Object.keys(relevantMap).find(key => relevantMap[key] === name)), name }));
  }

  const promise = fetchFromTMDB(`genre/${mediaType}/list`).then(data => {
    const newMap = {};
    (data.genres || []).forEach(genre => {
      newMap[genre.id] = genre.name;
    });
    if (mediaType === 'movie') {
      genreMapMovie = newMap;
    } else {
      genreMapTV = newMap;
    }
    return data.genres || [];
  }).catch(error => {
    console.error(`Failed to fetch ${mediaType} genres:`, error);
    if (mediaType === 'movie') genresPromiseMovie = null; else genresPromiseTV = null;
    return []; 
  });

  if (mediaType === 'movie') {
    genresPromiseMovie = promise;
  } else {
    genresPromiseTV = promise;
  }
  
  return promise;
};

genresPromiseMovie = getGenresTMDB('movie');
genresPromiseTV = getGenresTMDB('tv');


export const searchTMDB = async (query, page = 1, genreIds = [], mediaType = 'multi') => {
  await Promise.all([genresPromiseMovie, genresPromiseTV].filter(p => p !== null));
  
  let endpoint = 'search/multi';
  const params = { query, page, include_adult: 'false' };

  if (mediaType === 'movie' || mediaType === 'tv') {
    endpoint = `search/${mediaType}`;
    if (genreIds.length > 0) {
      params.with_genres = genreIds.join(',');
    }
  }
  
  try {
    const data = await fetchFromTMDB(endpoint, params);
    
    let results = (data.results || [])
      .filter(item => item.id && (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path) 
      .map(item => mapTMDBToCinezaMovie(item, item.media_type));

    if (mediaType === 'multi' && genreIds.length > 0) {
      results = results.filter(movie => 
        genreIds.every(gid => movie.genre_ids.includes(gid))
      );
    }
    
    return {
      results,
      totalPages: data.total_pages || 0,
      totalResults: data.total_results || 0,
    };
  } catch (error) {
    console.error(`Error in searchTMDB for query "${query}", mediaType "${mediaType}":`, error);
    return { results: [], totalPages: 0, totalResults: 0 };
  }
};

export const getTMDBMovieDetails = async (tmdbId, mediaType = 'movie') => {
  await Promise.all([genresPromiseMovie, genresPromiseTV].filter(p => p !== null));
  const endpoint = mediaType === 'tv' ? `tv/${tmdbId}` : `movie/${tmdbId}`;
  
  try {
    const data = await fetchFromTMDB(endpoint, { append_to_response: 'credits,videos,recommendations' });
    
    if (!data || !data.id) {
      throw new Error(`No details found for ${mediaType} ID ${tmdbId}`);
    }

    const cinezaMovie = mapTMDBToCinezaMovie(data, mediaType);
    cinezaMovie.genre = (data.genres || []).map(g => g.name).join(', ') || 'Desconhecido';

    if (mediaType === 'movie' && data.credits?.crew) {
      const director = data.credits.crew.find(person => person.job === 'Director');
      cinezaMovie.director = director?.name;
    } else if (mediaType === 'tv' && data.created_by?.length > 0) {
      cinezaMovie.creators = data.created_by.map(creator => creator.name).join(', ');
    }
    
    return cinezaMovie;
  } catch (error) {
    console.error(`Error in getTMDBMovieDetails for ID ${tmdbId}, mediaType ${mediaType}:`, error);
    return null; 
  }
};


export const getPopularTMDB = async (mediaType = 'movie', page = 1, genreIds = []) => {
  await Promise.all([genresPromiseMovie, genresPromiseTV].filter(p => p !== null));
  const endpoint = mediaType === 'tv' ? 'tv/popular' : 'movie/popular';
  const params = { page };
  if (genreIds.length > 0) {
    params.with_genres = genreIds.join(',');
  }
  try {
    const data = await fetchFromTMDB(endpoint, params);
    return {
      results: (data.results || []).filter(item => item.id && item.poster_path).map(item => mapTMDBToCinezaMovie({...item, media_type: mediaType })),
      totalPages: data.total_pages || 0,
    };
  } catch (error) {
    console.error(`Error in getPopularTMDB for mediaType ${mediaType}:`, error);
    return { results: [], totalPages: 0 };
  }
};

export const getTrendingTMDB = async (mediaType = 'all', timeWindow = 'week') => {
  await Promise.all([genresPromiseMovie, genresPromiseTV].filter(p => p !== null));
  try {
    const data = await fetchFromTMDB(`trending/${mediaType}/${timeWindow}`);
    return (data.results || [])
      .filter(item => item.id && (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path)
      .map(item => mapTMDBToCinezaMovie(item));
  } catch (error) {
    console.error(`Error in getTrendingTMDB for mediaType ${mediaType}:`, error);
    return [];
  }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const ensureMovieInDb = async (tmdbMovieData, retries = 3, baseDelay = 100) => {
  if (!tmdbMovieData || !tmdbMovieData.tmdb_id) {
    console.error("ensureMovieInDb: tmdb_id é obrigatório. Dados recebidos:", tmdbMovieData);
    throw new Error("Dados do filme TMDB inválidos para salvar no banco: tmdb_id ausente.");
  }
  if (!tmdbMovieData.media_type) {
    console.error("ensureMovieInDb: media_type é obrigatório. Dados recebidos:", tmdbMovieData);
    throw new Error("Dados do filme TMDB inválidos para salvar no banco: media_type ausente.");
  }
  
  await Promise.all([genresPromiseMovie, genresPromiseTV].filter(p => p !== null));

  try {
    let { data: existingMovie, error: fetchError } = await supabase
      .from('movies')
      .select('*')
      .eq('tmdb_id', tmdbMovieData.tmdb_id)
      .eq('media_type', tmdbMovieData.media_type)
      .maybeSingle();

    if (fetchError) {
      console.error(`Erro ao buscar filme no DB (tmdb_id: ${tmdbMovieData.tmdb_id}, media_type: ${tmdbMovieData.media_type}):`, fetchError.message);
      throw new Error(`Erro ao buscar filme no banco: ${fetchError.message}`);
    }

    if (existingMovie) {
      return existingMovie;
    }
    
    const genreString = getGenreNamesByIds(tmdbMovieData.genre_ids, tmdbMovieData.media_type);

    const movieToInsert = {
      tmdb_id: tmdbMovieData.tmdb_id,
      title: tmdbMovieData.title || 'Título Desconhecido',
      director: tmdbMovieData.director || tmdbMovieData.creators,
      year: tmdbMovieData.year,
      genre: genreString, 
      poster_url: tmdbMovieData.poster_url,
      description: tmdbMovieData.description,
      media_type: tmdbMovieData.media_type,
      release_date: tmdbMovieData.release_date || null,
      backdrop_url: tmdbMovieData.backdrop_url,
    };
    
    const { data: newMovie, error: insertError } = await supabase
      .from('movies')
      .insert(movieToInsert)
      .select()
      .single(); 

    if (insertError) {
      if (insertError.code === '23505') { 
        console.warn(`ensureMovieInDb: Conflito de chave duplicada (23505) ao inserir tmdb_id: ${tmdbMovieData.tmdb_id}, media_type: ${tmdbMovieData.media_type}. Tentando buscar novamente.`);
        for (let i = 0; i < retries; i++) {
          await delay(baseDelay * Math.pow(2, i)); 
          let { data: concurrentlyInsertedMovie, error: refetchError } = await supabase
            .from('movies')
            .select('*')
            .eq('tmdb_id', tmdbMovieData.tmdb_id)
            .eq('media_type', tmdbMovieData.media_type)
            .maybeSingle(); 
          
          if (refetchError) {
            console.error(`Erro na tentativa ${i+1} de re-buscar filme após erro de duplicata (tmdb_id: ${tmdbMovieData.tmdb_id}):`, refetchError.message);
            if (i === retries - 1) throw new Error(`Erro ao re-buscar filme após duplicata (múltiplas tentativas): ${refetchError.message}`);
          } else if (concurrentlyInsertedMovie) {
            console.log(`Filme tmdb_id: ${tmdbMovieData.tmdb_id} encontrado na tentativa ${i+1} após duplicata.`);
            return concurrentlyInsertedMovie;
          }
          console.warn(`Tentativa ${i+1} de re-buscar tmdb_id: ${tmdbMovieData.tmdb_id} falhou. Próxima tentativa em ${baseDelay * Math.pow(2, i+1)}ms...`);
        }
        throw new Error(`Filme não encontrado após tentativa de inserção duplicada (tmdb_id: ${tmdbMovieData.tmdb_id}, media_type: ${tmdbMovieData.media_type}) e ${retries} tentativas de re-busca.`);
      }
      console.error(`Erro ao inserir filme no DB (tmdb_id: ${tmdbMovieData.tmdb_id}, media_type: ${tmdbMovieData.media_type}):`, insertError.message);
      throw new Error(`Erro ao inserir filme no banco: ${insertError.message}`);
    }
    if (!newMovie) {
      throw new Error(`Falha ao inserir novo filme no banco (tmdb_id: ${tmdbMovieData.tmdb_id}), nenhum dado retornado.`);
    }
    return newMovie;
  } catch (error) {
    console.error(`Exceção em ensureMovieInDb para tmdb_id ${tmdbMovieData.tmdb_id}:`, error.message);
    throw error; 
  }
};
