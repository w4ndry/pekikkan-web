import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Quote } from '../types';
import toast from 'react-hot-toast';

export interface UserStats {
  quotesCount: number;
  followersCount: number;
  followingCount: number;
  likedQuotes: Quote[];
  savedQuotes: Quote[];
}

export const useProfile = () => {
  const [stats, setStats] = useState<UserStats>({
    quotesCount: 0,
    followersCount: 0,
    followingCount: 0,
    likedQuotes: [],
    savedQuotes: [],
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch quotes count
      const { count: quotesCount } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch followers count
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      // Fetch following count
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);

      // Fetch liked quotes
      const { data: likedInteractions } = await supabase
        .from('interactions')
        .select(`
          quote_id,
          quotes (
            *,
            user:users(username, full_name, avatar_url)
          )
        `)
        .eq('user_id', user.id)
        .eq('type', 'like');

      // Fetch saved quotes
      const { data: savedInteractions } = await supabase
        .from('interactions')
        .select(`
          quote_id,
          quotes (
            *,
            user:users(username, full_name, avatar_url)
          )
        `)
        .eq('user_id', user.id)
        .eq('type', 'save');

      const likedQuotes = likedInteractions?.map(interaction => ({
        ...interaction.quotes,
        isLiked: true,
        isSaved: false,
      })) || [];

      const savedQuotes = savedInteractions?.map(interaction => ({
        ...interaction.quotes,
        isLiked: false,
        isSaved: true,
      })) || [];

      setStats({
        quotesCount: quotesCount || 0,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        likedQuotes,
        savedQuotes,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  return {
    stats,
    loading,
    refreshStats: fetchUserStats,
  };
};