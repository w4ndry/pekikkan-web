import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Quote } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select(`
          *,
          user:users(username, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (quotesError) throw quotesError;

      if (user) {
        // Fetch user interactions for authenticated users
        const { data: interactions } = await supabase
          .from('interactions')
          .select('quote_id, type')
          .eq('user_id', user.id);

        const quotesWithInteractions = quotesData?.map(quote => ({
          ...quote,
          isLiked: interactions?.some(i => i.quote_id === quote.id && i.type === 'like') || false,
          isSaved: interactions?.some(i => i.quote_id === quote.id && i.type === 'save') || false,
        })) || [];

        setQuotes(quotesWithInteractions);
      } else {
        // For non-authenticated users, set default interaction states
        const quotesWithDefaults = quotesData?.map(quote => ({
          ...quote,
          isLiked: false,
          isSaved: false,
        })) || [];

        setQuotes(quotesWithDefaults);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const likeQuote = async (quoteId: string) => {
    if (!user) {
      toast.error('Please sign in to like quotes');
      return;
    }

    try {
      const quote = quotes.find(q => q.id === quoteId);
      if (!quote) return;

      if (quote.isLiked) {
        // Unlike
        await supabase
          .from('interactions')
          .delete()
          .eq('user_id', user.id)
          .eq('quote_id', quoteId)
          .eq('type', 'like');

        await supabase
          .from('quotes')
          .update({ like_count: Math.max(0, quote.like_count - 1) })
          .eq('id', quoteId);
      } else {
        // Like
        await supabase
          .from('interactions')
          .insert({
            user_id: user.id,
            quote_id: quoteId,
            type: 'like'
          });

        await supabase
          .from('quotes')
          .update({ like_count: quote.like_count + 1 })
          .eq('id', quoteId);
      }

      // Update local state
      setQuotes(prev => prev.map(q => 
        q.id === quoteId 
          ? { 
              ...q, 
              isLiked: !q.isLiked,
              like_count: q.isLiked ? q.like_count - 1 : q.like_count + 1
            }
          : q
      ));
    } catch (error) {
      console.error('Error liking quote:', error);
      toast.error('Failed to like quote');
    }
  };

  const saveQuote = async (quoteId: string) => {
    if (!user) {
      toast.error('Please sign in to save quotes');
      return;
    }

    try {
      const quote = quotes.find(q => q.id === quoteId);
      if (!quote) return;

      if (quote.isSaved) {
        // Unsave
        await supabase
          .from('interactions')
          .delete()
          .eq('user_id', user.id)
          .eq('quote_id', quoteId)
          .eq('type', 'save');

        await supabase
          .from('quotes')
          .update({ save_count: Math.max(0, quote.save_count - 1) })
          .eq('id', quoteId);
      } else {
        // Save
        await supabase
          .from('interactions')
          .insert({
            user_id: user.id,
            quote_id: quoteId,
            type: 'save'
          });

        await supabase
          .from('quotes')
          .update({ save_count: quote.save_count + 1 })
          .eq('id', quoteId);
      }

      // Update local state
      setQuotes(prev => prev.map(q => 
        q.id === quoteId 
          ? { 
              ...q, 
              isSaved: !q.isSaved,
              save_count: q.isSaved ? q.save_count - 1 : q.save_count + 1
            }
          : q
      ));

      toast.success(quote.isSaved ? 'Quote unsaved' : 'Quote saved');
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Failed to save quote');
    }
  };

  const reportQuote = async (quoteId: string) => {
    if (!user) {
      toast.error('Please sign in to report quotes');
      return;
    }

    try {
      await supabase
        .from('interactions')
        .insert({
          user_id: user.id,
          quote_id: quoteId,
          type: 'report'
        });

      toast.success('Quote reported successfully');
    } catch (error) {
      console.error('Error reporting quote:', error);
      toast.error('Failed to report quote');
    }
  };

  const nextQuote = () => {
    setCurrentIndex(prev => Math.min(prev + 1, quotes.length - 1));
  };

  const previousQuote = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    fetchQuotes();
  }, [user]);

  return {
    quotes,
    loading,
    currentIndex,
    currentQuote: quotes[currentIndex],
    fetchQuotes,
    likeQuote,
    saveQuote,
    reportQuote,
    nextQuote,
    previousQuote,
  };
};