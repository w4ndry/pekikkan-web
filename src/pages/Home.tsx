import React from 'react';
import { MobileLayout } from '../components/Layout/MobileLayout';
import { BottomNavigation } from '../components/Layout/BottomNavigation';
import { QuoteCard } from '../components/Quote/QuoteCard';
import { useQuotes } from '../hooks/useQuotes';

export const Home: React.FC = () => {
  const {
    currentQuote,
    loading,
    nextQuote,
    previousQuote,
  } = useQuotes();

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quotes...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!currentQuote) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-6">
            <p className="text-gray-600 text-lg mb-4">No quotes available</p>
            <p className="text-gray-500">Check back later for more inspiration!</p>
          </div>
        </div>
        <BottomNavigation />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="h-screen pb-20">
        <QuoteCard
          quote={currentQuote}
          onNext={nextQuote}
          onPrevious={previousQuote}
        />
      </div>
      <BottomNavigation />
    </MobileLayout>
  );
};