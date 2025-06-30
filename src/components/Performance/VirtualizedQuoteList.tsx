import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Quote } from '../../types';
import { motion } from 'framer-motion';
import { Heart, Bookmark, User } from 'lucide-react';

interface VirtualizedQuoteListProps {
  quotes: Quote[];
  height: number;
  onQuoteClick: (quote: Quote) => void;
  itemHeight?: number;
}

interface QuoteItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    quotes: Quote[];
    onQuoteClick: (quote: Quote) => void;
  };
}

const QuoteItem: React.FC<QuoteItemProps> = ({ index, style, data }) => {
  const { quotes, onQuoteClick } = data;
  const quote = quotes[index];

  if (!quote) return null;

  return (
    <div style={style} className="px-4 py-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => onQuoteClick(quote)}
        className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      >
        <p className="text-gray-800 font-medium mb-3 leading-relaxed line-clamp-3">
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
    </div>
  );
};

export const VirtualizedQuoteList: React.FC<VirtualizedQuoteListProps> = ({
  quotes,
  height,
  onQuoteClick,
  itemHeight = 120,
}) => {
  const itemData = useMemo(
    () => ({
      quotes,
      onQuoteClick,
    }),
    [quotes, onQuoteClick]
  );

  if (quotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No quotes found</p>
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={quotes.length}
      itemSize={itemHeight}
      itemData={itemData}
      className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      {QuoteItem}
    </List>
  );
};