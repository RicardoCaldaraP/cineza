
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bookmark, MessageSquare, Edit3, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const MovieActions = ({ 
  isInWatchlist, 
  onToggleWatchlist, 
  onOpenReviewDialog, 
  userReviewExists,
  isEditingReview,
  cinezaMovieId,
  isUserLoggedIn
}) => {
  return (
    <motion.div 
      className="lg:col-span-1 bg-card p-6 rounded-xl shadow-lg space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h2 className="text-xl font-semibold text-foreground mb-3">Ações</h2>
      {isUserLoggedIn ? (
        <>
          <Button 
            onClick={onToggleWatchlist} 
            className="w-full justify-start text-base py-3" 
            variant={isInWatchlist ? "default" : "outline"}
            disabled={typeof cinezaMovieId !== 'number'}
          >
            <Bookmark className={`mr-2 h-5 w-5 ${isInWatchlist ? "" : "text-primary"}`} /> 
            {isInWatchlist ? 'Remover da Lista' : 'Adicionar à Lista'}
          </Button>
          <Button 
            onClick={onOpenReviewDialog} 
            className="w-full justify-start text-base py-3" 
            variant="outline"
            disabled={typeof cinezaMovieId !== 'number'}
          >
            {userReviewExists || isEditingReview ? <Edit3 className="mr-2 h-5 w-5 text-primary" /> : <MessageSquare className="mr-2 h-5 w-5 text-primary" /> }
            {userReviewExists || isEditingReview ? 'Editar Avaliação' : 'Escrever Avaliação'}
          </Button>
        </>
      ) : (
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">Faça login para avaliar e adicionar à sua lista.</p>
          <Button asChild className="w-full py-3">
            <Link to="/login">
              <LogIn className="mr-2 h-5 w-5" /> Entrar
            </Link>
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default MovieActions;
