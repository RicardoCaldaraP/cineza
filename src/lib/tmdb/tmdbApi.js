const TMDB_API_KEY =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4NGE3NThlMGEwOGMyYjVkNDFmMDM4ZjZhNDRmNTkzYyIsIm5iZiI6MTc0NjQ2NDAxMC40OCwic3ViIjoiNjgxOGVkMGE0ODZhZDY4ZmViNjQwMTYzIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.UbpCJM8JyZdiAWF7NcQLuVSoTkknoPdJ1V8HA9HuQwk";
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
