import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MobileLayout } from '../components/Layout/MobileLayout';
import { BottomNavigation } from '../components/Layout/BottomNavigation';
import { SearchBar } from '../components/Explore/SearchBar';
import { TrendingSection } from '../components/Explore/TrendingSection';
import { PopularAuthorsSection } from '../components/Explore/PopularAuthorsSection';
import { CategoriesSection } from '../components/Explore/CategoriesSection';
import { SearchResults } from '../components/Explore/SearchResults';
import { QuoteModal } from '../components/Explore/QuoteModal';
import { MetaTags } from '../components/SEO/MetaTags';
import { VirtualizedQuoteList } from '../components/Performance/VirtualizedQuoteList';
import { useExplore, TrendingQuote, PopularAuthor, Category } from '../hooks/useExplore';
import { useQuotes } from '../hooks/useQuotes';
import { useSEO } from '../hooks/useSEO';
import { Quote } from '../types';
import { ArrowLeft } from 'lucide-react';
import { analytics } from '../utils/analytics';

type ViewMode = 'main' | 'search' | 'category' | 'author';

export const Explore: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    trendingQuotes,
    popularAuthors,
    categories,
    loading,
    getQuotesByCategory,
    getQuotesByAuthor,
  } = useExplore();

  const { likeQuote, saveQuote, reportQuote } = useQuotes();
  const location = useLocation();

  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [categoryQuotes, setCategoryQuotes] = useState<Quote[]>([]);
  const [authorQuotes, setAuthorQuotes] = useState<Quote[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [currentAuthor, setCurrentAuthor] = useState<PopularAuthor | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // SEO data based on current view
  const seoData = useSEO(
    selectedQuote || undefined,
    currentAuthor?.author,
    currentCategory?.name
  );

  useEffect(() => {
    // Track page view
    analytics.trackPageView(location.pathname, 'Explore - Discover Quotes');
  }, [location.pathname]);

  useEffect(() => {
    // Track search queries
    if (searchQuery && searchResults.length > 0) {
      analytics.trackSearch(searchQuery, searchResults.length);
    }
  }, [searchQuery, searchResults.length]);

  const handleQuoteClick = (quote: Quote | TrendingQuote) => {
    setSelectedQuote(quote);
    analytics.trackEvent({
      action: 'view_quote_modal',
      category: 'Quote Interaction',
      label: `${quote.author} - ${quote.id}`,
    });
  };

  const handleCategoryClick = async (category: Category) => {
    setCategoryLoading(true);
    setCurrentCategory(category);
    setViewMode('category');
    
    analytics.trackEvent({
      action: 'view_category',
      category: 'Navigation',
      label: category.name,
    });
    
    const quotes = await getQuotesByCategory(category);
    setCategoryQuotes(quotes);
    setCategoryLoading(false);
  };

  const handleAuthorClick = async (author: PopularAuthor) => {
    setCategoryLoading(true);
    setCurrentAuthor(author);
    setViewMode('author');
    
    analytics.trackEvent({
      action: 'view_author',
      category: 'Navigation',
      label: author.author,
    });
    
    const quotes = await getQuotesByAuthor(author.author);
    setAuthorQuotes(quotes);
    setCategoryLoading(false);
  };

  const handleBackToMain = () => {
    setViewMode('main');
    setCurrentCategory(null);
    setCurrentAuthor(null);
    setCategoryQuotes([]);
    setAuthorQuotes([]);
    setSearchQuery('');
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setViewMode('search');
    } else {
      setViewMode('main');
    }
  };

  const handleLike = (id: string) => {
    likeQuote(id);
    const quote = selectedQuote || searchResults.find(q => q.id === id) || 
                  categoryQuotes.find(q => q.id === id) || authorQuotes.find(q => q.id === id);
    if (quote) {
      analytics.trackQuoteInteraction('like', id, quote.author);
    }
  };

  const handleSave = (id: string) => {
    saveQuote(id);
    const quote = selectedQuote || searchResults.find(q => q.id === id) || 
                  categoryQuotes.find(q => q.id === id) || authorQuotes.find(q => q.id === id);
    if (quote) {
      analytics.trackQuoteInteraction('save', id, quote.author);
    }
  };

  const handleReport = (id: string) => {
    reportQuote(id);
    const quote = selectedQuote || searchResults.find(q => q.id === id) || 
                  categoryQuotes.find(q => q.id === id) || authorQuotes.find(q => q.id === id);
    if (quote) {
      analytics.trackQuoteInteraction('report', id, quote.author);
    }
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'search':
        return (
          <SearchResults
            results={searchResults}
            loading={searchLoading}
            query={searchQuery}
            onQuoteClick={handleQuoteClick}
          />
        );

      case 'category':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleBackToMain}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {currentCategory?.icon} {currentCategory?.name}
                </h2>
                <p className="text-sm text-gray-600">{currentCategory?.description}</p>
              </div>
            </div>

            {categoryLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : categoryQuotes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No quotes found in this category</p>
              </div>
            ) : (
              <VirtualizedQuoteList
                quotes={categoryQuotes}
                height={600}
                onQuoteClick={handleQuoteClick}
              />
            )}
          </div>
        );

      case 'author':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleBackToMain}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                  {currentAuthor?.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {currentAuthor?.author}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {currentAuthor?.quote_count} quotes • {currentAuthor?.total_likes} likes
                  </p>
                </div>
              </div>
            </div>

            {categoryLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : authorQuotes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No quotes found by this author</p>
              </div>
            ) : (
              <VirtualizedQuoteList
                quotes={authorQuotes}
                height={600}
                onQuoteClick={handleQuoteClick}
              />
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            <TrendingSection
              quotes={trendingQuotes}
              loading={loading}
              onQuoteClick={handleQuoteClick}
            />
            
            <PopularAuthorsSection
              authors={popularAuthors}
              loading={loading}
              onAuthorClick={handleAuthorClick}
            />
            
            <CategoriesSection
              categories={categories}
              onCategoryClick={handleCategoryClick}
            />
          </div>
        );
    }
  };

  return (
    <>
      <MetaTags {...seoData} />
      <MobileLayout>
        <div className="h-screen bg-gray-50">
          <div className="p-4">
            <div className="mb-6">
              {viewMode === 'main' && (
                <h1 className="text-2xl font-bold text-gray-800 font-inter mb-4">Explore</h1>
              )}
              
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                loading={searchLoading}
              />
            </div>
            
            <div className="pb-24">
              {renderContent()}
            </div>
          </div>
        </div>
        
        <QuoteModal
          quote={selectedQuote}
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          onLike={handleLike}
          onSave={handleSave}
          onReport={handleReport}
        />
        
        <BottomNavigation />
      </MobileLayout>
    </>
  );
};