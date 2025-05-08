
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getUser, getMovie, toggleLikeReview } from '@/lib/storage'; // Removido getCurrentUser daqui
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext'; // Importa useAuth

const ReviewCard = ({ review }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth(); // Pega o usuário atual do contexto
  const user = getUser(review.userId);
  const movie = getMovie(review.movieId);
  
  // Verifica se user ou movie são nulos antes de tentar acessar propriedades
  if (!user || !movie) {
    // Pode retornar null ou um placeholder de carregamento/erro
    return null; 
  }

  const hasLiked = currentUser ? review.likes.includes(currentUser.id) : false;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleLike = () => {
    if (!currentUser) {
      toast({ title: "Ação requer login", description: "Faça login para curtir avaliações.", variant: "destructive" });
      return;
    }
    if (toggleLikeReview(review.id, currentUser.id)) {
      // Forçar re-renderização ou atualizar estado local se necessário
      // (localStorage não causa re-renderização automática)
      // Idealmente, o estado do feed/página seria atualizado
       toast({
         title: hasLiked ? "Curtida removida" : "Avaliação curtida",
         description: hasLiked 
           ? "Você removeu sua curtida desta avaliação." 
           : "Você curtiu esta avaliação.",
         duration: 3000,
       });
    } else {
       toast({ title: "Erro", description: "Não foi possível curtir/descurtir.", variant: "destructive" });
    }
  };
  
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { 
      y: -2, 
      boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    }
  };
  
  // Função para renderizar estrelas com base na nota (incluindo decimais)
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const decimalPart = rating - fullStars;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />);
      } else if (i === fullStars && decimalPart > 0) {
        // Estrela parcialmente preenchida usando gradiente ou clip-path
        // Usando gradiente para simplicidade
        stars.push(
          <div key={`partial-${i}`} className="relative w-4 h-4">
            <Star className="absolute inset-0 w-4 h-4 text-muted-foreground" />
            <Star 
              className="absolute inset-0 w-4 h-4 text-yellow-400 fill-yellow-400" 
              style={{ clipPath: `inset(0 ${100 - decimalPart * 100}% 0 0)` }} 
            />
          </div>
        );
      } else {
        stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-muted-foreground" />);
      }
    }
    return stars;
  };

  return (
    <motion.div 
      className="bg-card rounded-lg p-4 shadow-md"
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
    >
      <div className="flex justify-between items-start">
        <Link to={`/profile/${user.username}`} className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{user.name}</h3>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-2">
          <div className="flex">
            {renderStars(review.rating)} 
          </div>
          {/* Botão de mais opções pode ser implementado depois */}
          {/* <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button> */}
        </div>
      </div>
      
      <Link to={`/movie/${movie.id}`} className="mt-3 flex items-center gap-2">
        <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0">
          <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
        </div>
        <div>
          <h4 className="font-medium">{movie.title}</h4>
          <p className="text-xs text-muted-foreground">{movie.year} • {movie.genre}</p>
        </div>
      </Link>
      
      <p className="mt-3 text-sm">{review.comment}</p>
      
      <div className="mt-4 flex items-center justify-between">
        <motion.button 
          className="flex items-center gap-1 text-sm disabled:opacity-50"
          onClick={handleLike}
          whileTap={currentUser ? { scale: 0.95 } : {}}
          disabled={!currentUser}
        >
          <Heart className={`w-4 h-4 ${hasLiked ? 'text-primary fill-primary' : ''}`} />
          <span>{review.likes.length} {review.likes.length === 1 ? 'curtida' : 'curtidas'}</span>
        </motion.button>
        
        <span className="text-xs text-muted-foreground">{formatDate(review.date)}</span>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
