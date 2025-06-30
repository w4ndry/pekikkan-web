import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Heart, Bookmark, User } from 'lucide-react';
import { TrendingQuote } from '../../hooks/useExplore';

interface TrendingSectionProps {
  quotes: TrendingQuote[];
  loading: boolean;
  onQuoteClick: (quote: TrendingQuote) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  quotes,
  loading,
  onQuoteClick,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-primary" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Trending Now</h2>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600">No trending quotes available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-primary" size={24} />
        <h2 className="text-xl font-semibold text-gray-800">Trending Now</h2>
      </div>
      
      {quotes.map((quote, index) => (
        <motion.div
          key={quote.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onQuoteClick(quote)}
          className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 font-medium line-clamp-2 mb-2">
                "{quote.content}"
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={12} className="text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {quote.author}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Heart size={14} />
                    <span>{quote.like_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bookmark size={14} />
                    <span>{quote.save_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};