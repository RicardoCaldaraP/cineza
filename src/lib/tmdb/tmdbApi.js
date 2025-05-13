const TMDB_API_KEY = "84a758e0a08c2b5d41f038f6a44f593c";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const fetchFromTMDB = async (endpoint, params = {}) => {
  const urlParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "pt-BR",
    ...params,
  });
  const url = `${TMDB_BASE_URL}/${endpoint}?${urlParams}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        `TMDB API Error for ${url}: ${response.status} ${response.statusText}`
      );
      const errorData = await response.json().catch(() => null);
      console.error("TMDB Error Details:", errorData);
      throw new Error(`Erro na API TMDB: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from TMDB endpoint ${endpoint}:`, error);
    throw error;
  }
};
