import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Quote } from '../types';

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  image?: string;
  url: string;
  type: 'website' | 'article';
  quote?: Quote;
}

export const useSEO = (quote?: Quote, author?: string, category?: string) => {
  const location = useLocation();
  const [seoData, setSeoData] = useState<SEOData>({
    title: 'Pekikkan - Inspirational Quotes & Wisdom',
    description: 'Discover, share, and save inspirational quotes from great minds. Join our community of quote lovers and find daily motivation.',
    keywords: ['inspirational quotes', 'motivation', 'wisdom', 'daily inspiration'],
    url: `https://pekikkan.com${location.pathname}`,
    type: 'website'
  });

  useEffect(() => {
    const baseUrl = 'https://pekikkan.com';
    const currentUrl = `${baseUrl}${location.pathname}${location.search}`;

    let newSeoData: SEOData = {
      title: 'Pekikkan - Inspirational Quotes & Wisdom',
      description: 'Discover, share, and save inspirational quotes from great minds. Join our community of quote lovers and find daily motivation.',
      keywords: ['inspirational quotes', 'motivation', 'wisdom', 'daily inspiration', 'famous quotes'],
      url: currentUrl,
      type: 'website'
    };

    // Home page
    if (location.pathname === '/') {
      newSeoData = {
        ...newSeoData,
        title: 'Pekikkan - Daily Inspirational Quotes & Motivation',
        description: 'Start your day with inspiring quotes. Swipe through thousands of motivational quotes from famous authors, philosophers, and thought leaders.',
        keywords: ['daily quotes', 'inspirational quotes', 'motivation', 'wisdom', 'famous quotes', 'life quotes', 'success quotes']
      };
    }

    // Explore page
    else if (location.pathname === '/explore') {
      newSeoData = {
        ...newSeoData,
        title: 'Explore Quotes - Trending & Popular Inspirational Quotes | Pekikkan',
        description: 'Explore trending quotes, discover popular authors, and browse quotes by category. Find the perfect quote for every moment.',
        keywords: ['trending quotes', 'popular quotes', 'quote categories', 'famous authors', 'explore quotes', 'quote discovery']
      };
    }

    // Post page
    else if (location.pathname === '/post') {
      newSeoData = {
        ...newSeoData,
        title: 'Share Your Favorite Quote - Post Inspirational Quotes | Pekikkan',
        description: 'Share your favorite inspirational quotes with our community. Help others find motivation and wisdom through powerful words.',
        keywords: ['share quotes', 'post quotes', 'submit quotes', 'quote community', 'inspirational sharing']
      };
    }

    // Profile page
    else if (location.pathname === '/profile') {
      newSeoData = {
        ...newSeoData,
        title: 'My Profile - Saved Quotes & Liked Quotes | Pekikkan',
        description: 'Manage your saved quotes, view your liked quotes, and track your quote sharing activity.',
        keywords: ['profile', 'saved quotes', 'liked quotes', 'quote collection', 'personal quotes']
      };
    }

    // Individual quote page
    if (quote) {
      const truncatedContent = quote.content.length > 100 
        ? `${quote.content.substring(0, 100)}...` 
        : quote.content;
      
      newSeoData = {
        ...newSeoData,
        title: `"${truncatedContent}" - ${quote.author} | Pekikkan`,
        description: `${quote.content} - Inspirational quote by ${quote.author}. Share this motivational quote and find more wisdom on Pekikkan.`,
        keywords: [
          'quote by ' + quote.author.toLowerCase(),
          quote.author.toLowerCase() + ' quotes',
          'inspirational quotes',
          'motivational quotes',
          'wisdom quotes',
          ...quote.content.toLowerCase().split(' ').filter(word => word.length > 4).slice(0, 5)
        ],
        type: 'article',
        quote
      };
    }

    // Author page
    if (author) {
      newSeoData = {
        ...newSeoData,
        title: `${author} Quotes - Inspirational Quotes by ${author} | Pekikkan`,
        description: `Discover the most inspiring quotes by ${author}. Read, save, and share wisdom from this renowned author.`,
        keywords: [
          author.toLowerCase() + ' quotes',
          'quotes by ' + author.toLowerCase(),
          author.toLowerCase() + ' wisdom',
          'inspirational quotes',
          'famous quotes',
          'author quotes'
        ]
      };
    }

    // Category page
    if (category) {
      newSeoData = {
        ...newSeoData,
        title: `${category} Quotes - Inspirational ${category} Quotes | Pekikkan`,
        description: `Explore the best ${category.toLowerCase()} quotes. Find motivation and inspiration in our curated collection of ${category.toLowerCase()} quotes.`,
        keywords: [
          category.toLowerCase() + ' quotes',
          'inspirational ' + category.toLowerCase(),
          category.toLowerCase() + ' motivation',
          'quotes about ' + category.toLowerCase(),
          'inspirational quotes',
          'motivational quotes'
        ]
      };
    }

    setSeoData(newSeoData);
  }, [location, quote, author, category]);

  return seoData;
};