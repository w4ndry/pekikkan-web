import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Quote, UserProfile } from '../types';
import toast from 'react-hot-toast';

export interface TrendingQuote extends Quote {
  trending_score: number;
}

export interface PopularAuthor {
  author: string;
  quote_count: number;
  total_likes: number;
  total_saves: number;
  recent_quote?: Quote;
}

export interface Category {
  name: string;
  description: string;
  quote_count: number;
  icon: string;
  keywords: string[];
}

export const useExplore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Quote[]>([]);
  const [trendingQuotes, setTrendingQuotes] = useState<TrendingQuote[]>([]);
  const [popularAuthors, setPopularAuthors] = useState<PopularAuthor[]>([]);
  const [categories] = useState<Category[]>([
    {
      name: 'Motivation',
      description: 'Quotes to inspire and motivate',
      quote_count: 0,
      icon: '🚀',
      keywords: ['motivation', 'inspire', 'success', 'achieve', 'goal', 'dream', 'ambition', 'determination']
    },
    {
      name: 'Love & Relationships',
      description: 'Quotes about love, friendship, and relationships',
      quote_count: 0,
      icon: '❤️',
      keywords: ['love', 'relationship', 'friendship', 'heart', 'romance', 'family', 'together', 'care']
    },
    {
      name: 'Wisdom',
      description: 'Timeless wisdom and life lessons',
      quote_count: 0,
      icon: '🧠',
      keywords: ['wisdom', 'knowledge', 'learn', 'experience', 'truth', 'understanding', 'insight', 'philosophy']
    },
    {
      name: 'Happiness',
      description: 'Quotes about joy, positivity, and happiness',
      quote_count: 0,
      icon: '😊',
      keywords: ['happiness', 'joy', 'smile', 'positive', 'cheerful', 'optimism', 'gratitude', 'blessed']
    },
    {
      name: 'Life',
      description: 'Reflections on life and living',
      quote_count: 0,
      icon: '🌱',
      keywords: ['life', 'living', 'existence', 'journey', 'path', 'growth', 'change', 'time']
    },
    {
      name: 'Success',
      description: 'Quotes about achievement and success',
      quote_count: 0,
      icon: '🏆',
      keywords: ['success', 'achievement', 'victory', 'win', 'accomplish', 'excel', 'triumph', 'progress']
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchTrendingQuotes = async () => {
    try {
      setLoading(true);
      
      // Get quotes with their interaction counts from the last 7 days
      const { data: quotes, error } = await supabase
        .from('quotes')
        .select(`
          *,
          user:users(username, full_name, avatar_url)
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('like_count', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Calculate trending score based on likes, saves, and recency
      const trendingQuotes = quotes?.map(quote => {
        const daysSinceCreated = Math.max(1, Math.floor((Date.now() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24)));
        const trending_score = (quote.like_count * 2 + quote.save_count * 3) / daysSinceCreated;
        
        return {
          ...quote,
          trending_score,
          isLiked: false,
          isSaved: false,
        };
      }).sort((a, b) => b.trending_score - a.trending_score) || [];

      setTrendingQuotes(trendingQuotes);
    } catch (error) {
      console.error('Error fetching trending quotes:', error);
      toast.error('Failed to load trending quotes');
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularAuthors = async () => {
    try {
      const { data: authorStats, error } = await supabase
        .from('quotes')
        .select('author, like_count, save_count, created_at, content, id')
        .order('like_count', { ascending: false });

      if (error) throw error;

      // Group by author and calculate stats
      const authorMap = new Map<string, {
        author: string;
        quote_count: number;
        total_likes: number;
        total_saves: number;
        recent_quote?: Quote;
        latest_date: string;
      }>();

      authorStats?.forEach(quote => {
        const existing = authorMap.get(quote.author);
        if (existing) {
          existing.quote_count += 1;
          existing.total_likes += quote.like_count;
          existing.total_saves += quote.save_count;
          
          // Update recent quote if this one is more recent
          if (quote.created_at > existing.latest_date) {
            existing.recent_quote = {
              ...quote,
              user_id: '',
              updated_at: quote.created_at,
              user: undefined,
              isLiked: false,
              isSaved: false,
            };
            existing.latest_date = quote.created_at;
          }
        } else {
          authorMap.set(quote.author, {
            author: quote.author,
            quote_count: 1,
            total_likes: quote.like_count,
            total_saves: quote.save_count,
            recent_quote: {
              ...quote,
              user_id: '',
              updated_at: quote.created_at,
              user: undefined,
              isLiked: false,
              isSaved: false,
            },
            latest_date: quote.created_at,
          });
        }
      });

      // Convert to array and sort by popularity score
      const popularAuthors = Array.from(authorMap.values())
        .map(({ latest_date, ...author }) => author)
        .sort((a, b) => {
          const scoreA = a.total_likes * 2 + a.total_saves * 3 + a.quote_count;
          const scoreB = b.total_likes * 2 + b.total_saves * 3 + b.quote_count;
          return scoreB - scoreA;
        })
        .slice(0, 10);

      setPopularAuthors(popularAuthors);
    } catch (error) {
      console.error('Error fetching popular authors:', error);
      toast.error('Failed to load popular authors');
    }
  };

  const searchQuotes = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      
      const { data: quotes, error } = await supabase
        .from('quotes')
        .select(`
          *,
          user:users(username, full_name, avatar_url)
        `)
        .or(`content.ilike.%${query}%,author.ilike.%${query}%`)
        .order('like_count', { ascending: false })
        .limit(20);

      if (error) throw error;

      const quotesWithDefaults = quotes?.map(quote => ({
        ...quote,
        isLiked: false,
        isSaved: false,
      })) || [];

      setSearchResults(quotesWithDefaults);
    } catch (error) {
      console.error('Error searching quotes:', error);
      toast.error('Failed to search quotes');
    } finally {
      setSearchLoading(false);
    }
  };

  const getQuotesByCategory = async (category: Category): Promise<Quote[]> => {
    try {
      // Create a search pattern for all keywords in the category
      const keywordPattern = category.keywords.map(keyword => `content.ilike.%${keyword}%`).join(',');
      
      const { data: quotes, error } = await supabase
        .from('quotes')
        .select(`
          *,
          user:users(username, full_name, avatar_url)
        `)
        .or(keywordPattern)
        .order('like_count', { ascending: false })
        .limit(20);

      if (error) throw error;

      return quotes?.map(quote => ({
        ...quote,
        isLiked: false,
        isSaved: false,
      })) || [];
    } catch (error) {
      console.error('Error fetching category quotes:', error);
      toast.error(`Failed to load ${category.name} quotes`);
      return [];
    }
  };

  const getQuotesByAuthor = async (authorName: string): Promise<Quote[]> => {
    try {
      const { data: quotes, error } = await supabase
        .from('quotes')
        .select(`
          *,
          user:users(username, full_name, avatar_url)
        `)
        .eq('author', authorName)
        .order('like_count', { ascending: false })
        .limit(20);

      if (error) throw error;

      return quotes?.map(quote => ({
        ...quote,
        isLiked: false,
        isSaved: false,
      })) || [];
    } catch (error) {
      console.error('Error fetching author quotes:', error);
      toast.error(`Failed to load quotes by ${authorName}`);
      return [];
    }
  };

  useEffect(() => {
    fetchTrendingQuotes();
    fetchPopularAuthors();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchQuotes(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    trendingQuotes,
    popularAuthors,
    categories,
    loading,
    fetchTrendingQuotes,
    fetchPopularAuthors,
    getQuotesByCategory,
    getQuotesByAuthor,
  };
};