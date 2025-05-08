
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage = ({ message }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="p-8 rounded-xl bg-card shadow-2xl max-w-md w-full"
      >
        <AlertTriangle className="mx-auto h-20 w-20 text-destructive mb-6" />
        <h1 className="text-4xl font-bold text-foreground mb-3">Oops!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          {message || "A página que você está procurando não foi encontrada."}
        </p>
        <Button asChild size="lg" className="text-base">
          <Link to="/">
            <Home className="mr-2 h-5 w-5" />
            Voltar para o Início
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
