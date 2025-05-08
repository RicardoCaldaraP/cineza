
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDateTime, generateAvatarFallback } from '@/lib/utils';

const CommentCard = ({ comment }) => {
  if (!comment || !comment.users) {
    return <div className="shimmer h-16 w-full rounded-lg"></div>;
  }

  const author = comment.users;

  return (
    <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
      <Link to={`/profile/${author.username}`}>
        <Avatar className="h-9 w-9">
          <AvatarImage src={author.avatar_url} alt={author.name} />
          <AvatarFallback>{generateAvatarFallback(author.name)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <Link to={`/profile/${author.username}`}>
            <span className="text-xs font-semibold text-foreground hover:text-primary">{author.name}</span>
          </Link>
          <span className="text-xs text-muted-foreground">{formatDateTime(comment.created_at)}</span>
        </div>
        <p className="text-xs text-foreground/80 mt-0.5 whitespace-pre-wrap">{comment.comment_text}</p>
      </div>
    </div>
  );
};

export default CommentCard;
