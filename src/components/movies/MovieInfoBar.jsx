
import React from 'react';
import { Calendar, Clock, Tv, Film, Users, Languages, DollarSign, TrendingUp, Building, Network } from 'lucide-react';

const InfoItem = ({ icon: Icon, label, value, condition = true }) => {
  if (!condition || !value) return null;
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <Icon className="w-4 h-4 mr-2 text-primary/80" />
      <span className="font-medium text-foreground/90 mr-1">{label}:</span> {value}
    </div>
  );
};

const MovieInfoBar = ({ movie }) => {
  if (!movie) return null;

  const formatRuntime = (runtime) => {
    if (!runtime) return null;
    if (Array.isArray(runtime)) { // For TV shows, episode_run_time can be an array
        if (runtime.length === 0) return null;
        const avgRuntime = runtime.reduce((a, b) => a + b, 0) / runtime.length;
        return `${Math.round(avgRuntime)} min (média por ep.)`;
    }
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}min`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return null;
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const productionCompanies = movie.production_companies?.map(pc => pc.name).join(', ');
  const networks = movie.networks?.map(n => n.name).join(', ');

  return (
    <div className="bg-card border border-border/50 p-4 rounded-xl shadow-md space-y-2.5">
      <InfoItem icon={Calendar} label="Lançamento" value={formatDate(movie.release_date)} />
      <InfoItem 
        icon={Clock} 
        label="Duração" 
        value={movie.media_type === 'movie' ? formatRuntime(movie.runtime) : formatRuntime(movie.episode_run_time)} 
      />
      {movie.media_type === 'tv' && (
        <>
          <InfoItem icon={Tv} label="Temporadas" value={movie.number_of_seasons} />
          <InfoItem icon={Film} label="Episódios" value={movie.number_of_episodes} />
        </>
      )}
      <InfoItem icon={Languages} label="Idioma Original" value={movie.original_language?.toUpperCase()} />
      <InfoItem icon={Users} label="Status" value={movie.status} />
      <InfoItem icon={DollarSign} label="Orçamento" value={formatCurrency(movie.budget)} condition={movie.budget > 0} />
      <InfoItem icon={TrendingUp} label="Receita" value={formatCurrency(movie.revenue)} condition={movie.revenue > 0} />
      <InfoItem icon={Building} label="Produtoras" value={productionCompanies} condition={!!productionCompanies} />
      <InfoItem icon={Network} label="Emissoras" value={networks} condition={!!networks && movie.media_type === 'tv'} />
    </div>
  );
};

export default MovieInfoBar;
