
import React from 'react';
import { motion } from 'framer-motion';
import { ScrollText } from 'lucide-react';

const MovieSynopsis = ({ description }) => {
  return (
    <motion.div 
      className="lg:col-span-2 bg-card p-6 rounded-xl shadow-lg"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
        <ScrollText className="h-6 w-6 mr-3 text-primary" />
        Sinopse
      </h2>
      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {description || 'Sinopse não disponível.'}
      </p>
    </motion.div>
  );
};

export default MovieSynopsis;
