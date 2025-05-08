
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateAvatarFallback, formatDateTime } from '@/lib/utils';
import { Bell, Heart, UserPlus, MessageSquare } from 'lucide-react';

const NotificationItem = ({ notification, onClick }) => {
  const navigate = useNavigate();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_follower': return <UserPlus className="h-5 w-5 text-blue-500" />;
      case 'review_like': return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment_like': return <MessageSquare className="h-5 w-5 text-green-500" />; // Assuming comment_like might be added
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTextAndLink = () => {
    const actorName = notification.actor?.name || notification.actor?.username || 'Alguém';
    let textContent = '';
    let linkPath = '#';

    if (notification.type === 'new_follower') {
      textContent = <p><span className="font-semibold">{actorName}</span> começou a seguir você.</p>;
      if (notification.actor?.username) {
        linkPath = `/profile/${notification.actor.username}`;
      }
    } else if (notification.type === 'review_like') {
      const movieTitle = notification.target_review?.movie_id?.title || 'sua avaliação';
      textContent = <p><span className="font-semibold">{actorName}</span> curtiu {movieTitle}.</p>;
      if (notification.target_review?.movie_id?.tmdb_id && notification.target_review?.movie_id?.media_type) {
        linkPath = `/item/${notification.target_review.movie_id.media_type}/${notification.target_review.movie_id.tmdb_id}`;
      }
    } else if (notification.type === 'comment_like') {
      textContent = <p><span className="font-semibold">{actorName}</span> curtiu seu comentário.</p>;
      // Add link to comment if applicable, e.g., to the review containing the comment
      if (notification.target_review?.movie_id?.tmdb_id && notification.target_review?.movie_id?.media_type) {
        linkPath = `/item/${notification.target_review.movie_id.media_type}/${notification.target_review.movie_id.tmdb_id}`;
      }
    } else {
      textContent = <p>Nova notificação.</p>;
    }
    return { textContent, linkPath };
  };

  const { textContent, linkPath } = getNotificationTextAndLink();

  const handleClick = (e) => {
    e.preventDefault(); // Prevent default link behavior if we handle navigation via onClick prop
    if (onClick) {
      onClick(notification, linkPath); // Pass notification and determined linkPath
    } else if (linkPath !== '#') {
      navigate(linkPath); // Fallback navigation if no onClick prop
    }
  };

  return (
    <div
      className={`p-3 hover:bg-accent cursor-pointer ${!notification.is_read ? 'bg-primary/5' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {notification.actor?.avatar_url ? (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={notification.actor.avatar_url} alt={notification.actor.name || notification.actor.username} />
            <AvatarFallback>{generateAvatarFallback(notification.actor.name || notification.actor.username)}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="mt-1">{getNotificationIcon(notification.type)}</div>
        )}
        <div className="flex-1 text-sm">
          {textContent}
          <p className="text-xs text-muted-foreground">{formatDateTime(notification.created_at)}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
