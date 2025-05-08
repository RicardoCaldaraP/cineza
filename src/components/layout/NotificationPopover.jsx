
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import NotificationItem from '@/components/layout/NotificationItem';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const NotificationPopover = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          created_at,
          type,
          is_read,
          actor:actor_id ( id, username, avatar_url, name ),
          target_review:target_review_id ( movie_id ( title, tmdb_id, media_type ) )
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({ title: "Erro ao buscar notificações", description: error.message, variant: "destructive" });
    }
  }, [currentUser, toast]);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      
      const channel = supabase
        .channel(`notifications:${currentUser.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUser.id}` }, 
          (payload) => {
            fetchNotifications(); // Refetch all notifications to ensure correct order and actor data
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser, fetchNotifications]);

  const markNotificationsAsRead = async () => {
    if (!currentUser || unreadCount === 0) return;
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);
      
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };
  
  const markSingleNotificationAsRead = async (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || notification.is_read) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking single notification as read:", error);
    }
  };

  const handleNotificationItemClick = (notification, linkPath) => {
    setIsOpen(false); // Close popover
    if (linkPath && linkPath !== '#') {
      navigate(linkPath);
    }
    if (!notification.is_read) {
      markSingleNotificationAsRead(notification.id);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open && unreadCount > 0) {
        markNotificationsAsRead();
      }
    }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="nav-item w-full justify-start relative">
          <Bell className="h-5 w-5" />
          <span className="text-xs md:text-sm hidden md:inline">Notificações</span>
          {unreadCount > 0 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 md:w-96 p-0 max-h-[70vh] overflow-y-auto" side="right" align="start" sideOffset={10}>
        <div className="p-4">
          <h4 className="font-medium text-lg">Notificações</h4>
        </div>
        <Separator />
        {notifications.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Nenhuma notificação por enquanto.</p>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification}
                onClick={handleNotificationItemClick}
              />
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;
