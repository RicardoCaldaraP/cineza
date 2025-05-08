
import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ReviewForm from '@/components/reviews/ReviewForm';

const PostReviewPage = () => {
  const location = useLocation();
  
  const movieToReview = location.state?.movieToReview;
  const reviewToEdit = location.state?.reviewToEdit;
  const movieForEditingReview = location.state?.movie; 

  const isEditing = !!(reviewToEdit && movieForEditingReview);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-primary/10 to-background">
            <CardTitle className="text-3xl font-bold text-foreground">{isEditing ? "Editar Avaliação" : "Nova Avaliação"}</CardTitle>
            <CardDescription className="text-foreground/80">Compartilhe sua opinião sobre um filme ou série.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ReviewForm 
              initialMovieData={movieToReview || movieForEditingReview} 
              initialReviewData={reviewToEdit}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PostReviewPage;
