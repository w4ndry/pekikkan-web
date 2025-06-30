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

      // Set quotes without interaction data since actions are disabled
      setQuotes(quotesData || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
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
    nextQuote,
    previousQuote,
  };
};