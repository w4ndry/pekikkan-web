import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MobileLayout } from '../components/Layout/MobileLayout';
import { BottomNavigation } from '../components/Layout/BottomNavigation';
import { EnhancedTinderQuoteCard } from '../components/Quote/EnhancedTinderQuoteCard';
import { MetaTags } from '../components/SEO/MetaTags';
import { useQuotes } from '../hooks/useQuotes';
import { useSEO } from '../hooks/useSEO';
import { analytics } from '../utils/analytics';

export const Home: React.FC = () => {
  const {
    quotes,
    currentIndex,
    currentQuote,
    loading,
    likeQuote,
    saveQuote,
    reportQuote,
  } = useQuotes();
  
  const location = useLocation();
  const seoData = useSEO(currentQuote);

  useEffect(() => {
    // Track page view
    analytics.trackPageView(location.pathname, 'Home - Daily Inspirational Quotes');
  }, [location.pathname]);

  useEffect(() => {
    // Track quote view
    if (currentQuote) {
      analytics.trackEvent({
        action: 'view_quote',
        category: 'Quote Interaction',
        label: `${currentQuote.author} - ${currentQuote.id}`,
      });
    }
  }, [currentQuote]);

  const handleLike = (id: string) => {
    likeQuote(id);
    if (currentQuote) {
      analytics.trackQuoteInteraction('like', id, currentQuote.author);
    }
  };

  const handleSave = (id: string) => {
    saveQuote(id);
    if (currentQuote) {
      analytics.trackQuoteInteraction('save', id, currentQuote.author);
    }
  };

  const handleReport = (id: string) => {
    reportQuote(id);
    if (currentQuote) {
      analytics.trackQuoteInteraction('report', id, currentQuote.author);
    }
  };

  const handleIndexChange = (index: number) => {
    const quote = quotes[index];
    if (quote) {
      analytics.trackEvent({
        action: 'navigate_to_quote',
        category: 'Navigation',
        label: `${quote.author} - ${quote.id}`,
        value: index,
      });
    }
  };

  if (loading) {
    return (
      <>
        <MetaTags {...seoData} />
        <MobileLayout>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading quotes...</p>
            </div>
          </div>
        </MobileLayout>
      </>
    );
  }

  if (!quotes.length) {
    return (
      <>
        <MetaTags {...seoData} />
        <MobileLayout>
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <p className="text-gray-600 text-lg mb-4">No quotes available</p>
              <p className="text-gray-500">Check back later for more inspiration!</p>
            </div>
          </div>
          <BottomNavigation />
        </MobileLayout>
      </>
    );
  }

  return (
    <>
      <MetaTags {...seoData} />
      <MobileLayout>
        <div className="h-screen pb-20 overflow-hidden">
          <EnhancedTinderQuoteCard
            quotes={quotes}
            initialIndex={currentIndex}
            onLike={handleLike}
            onSave={handleSave}
            onReport={handleReport}
            onIndexChange={handleIndexChange}
          />
        </div>
        <BottomNavigation />
      </MobileLayout>
    </>
  );
};