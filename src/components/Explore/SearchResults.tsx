import React from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, Bookmark, User } from 'lucide-react';
import { Quote } from '../../types';

interface SearchResultsProps {
  results: Quote[];
  loading: boolean;
  query: string;
  onQuoteClick: (quote: Quote) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  query,
  onQuoteClick,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="text-primary" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">
            Searching for "{query}"...
          </h2>
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

  if (!query) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <Search className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No results found for "{query}"
        </h3>
        <p className="text-gray-600">
          Try searching with different keywords or browse our categories
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="text-primary" size={24} />
        <h2 className="text-xl font-semibold text-gray-800">
          Results for "{query}" ({results.length})
        </h2>
      </div>
      
      {results.map((quote, index) => (
        <motion.div
          key={quote.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onQuoteClick(quote)}
          className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <p className="text-gray-800 font-medium mb-3 leading-relaxed">
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
              {quote.user && (
                <span className="text-xs text-gray-500">
                  by @{quote.user.username}
                </span>
              )}
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
        </motion.div>
      ))}
    </div>
  );
};