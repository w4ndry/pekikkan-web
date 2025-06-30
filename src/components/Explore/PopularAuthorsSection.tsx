import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Bookmark, Quote as QuoteIcon } from 'lucide-react';
import { PopularAuthor } from '../../hooks/useExplore';

interface PopularAuthorsSectionProps {
  authors: PopularAuthor[];
  loading: boolean;
  onAuthorClick: (author: PopularAuthor) => void;
}

export const PopularAuthorsSection: React.FC<PopularAuthorsSectionProps> = ({
  authors,
  loading,
  onAuthorClick,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-green-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-800">Popular Authors</h2>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (authors.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600">No popular authors available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="text-green-600" size={24} />
        <h2 className="text-xl font-semibold text-gray-800">Popular Authors</h2>
      </div>
      
      {authors.map((author, index) => (
        <motion.div
          key={author.author}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onAuthorClick(author)}
          className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
              {author.author.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">
                {author.author}
              </h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <QuoteIcon size={12} />
                  <span>{author.quote_count} quotes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart size={12} />
                  <span>{author.total_likes} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bookmark size={12} />
                  <span>{author.total_saves} saves</span>
                </div>
              </div>
              
              {author.recent_quote && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-1 italic">
                  "{author.recent_quote.content}"
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};