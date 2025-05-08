
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateAvatarFallback } from '@/lib/utils';

const ExploreUserCard = React.forwardRef(({ user }, ref) => {
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={itemVariants} ref={ref}>
      <Link to={`/profile/${user.username}`} className="block p-5 bg-card hover:bg-secondary rounded-xl transition-colors shadow-lg">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 mb-3 border-2 border-primary/50">
            <AvatarImage src={user.avatar_url} alt={user.name}/>
            <AvatarFallback>{generateAvatarFallback(user.name || user.username)}</AvatarFallback>
          </Avatar>
          <p className="font-semibold text-lg text-foreground truncate w-full">{user.name || user.username}</p>
          <p className="text-sm text-muted-foreground truncate w-full">@{user.username}</p>
          {user.bio && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{user.bio}</p>}
        </div>
      </Link>
    </motion.div>
  );
});

ExploreUserCard.displayName = 'ExploreUserCard';
export default ExploreUserCard;
