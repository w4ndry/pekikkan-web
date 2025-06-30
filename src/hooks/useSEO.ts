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
    title: 'Pekikkan - Inspire the world through words',
    description: 'Inspire the world through words. Discover, share, and save powerful quotes that motivate and transform lives. Join our community of word enthusiasts spreading inspiration globally.',
    keywords: ['inspire through words', 'inspirational quotes', 'motivational words', 'powerful quotes', 'life-changing quotes'],
    url: `https://pekikkan.com${location.pathname}`,
    type: 'website'
  });

  useEffect(() => {
    const baseUrl = 'https://pekikkan.com';
    const currentUrl = `${baseUrl}${location.pathname}${location.search}`;

    let newSeoData: SEOData = {
      title: 'Pekikkan - Inspire the world through words',
      description: 'Inspire the world through words. Discover, share, and save powerful quotes that motivate and transform lives. Join our community of word enthusiasts spreading inspiration globally.',
      keywords: ['inspire through words', 'inspirational quotes', 'motivational words', 'powerful quotes', 'life-changing quotes', 'daily inspiration'],
      url: currentUrl,
      type: 'website'
    };

    // Home page
    if (location.pathname === '/') {
      newSeoData = {
        ...newSeoData,
        title: 'Pekikkan - Inspire the world through words | Daily Motivational Quotes',
        description: 'Inspire the world through words. Start your day with powerful quotes that motivate and transform lives. Swipe through thousands of inspirational words from great minds.',
        keywords: ['inspire through words', 'daily quotes', 'inspirational quotes', 'motivational words', 'powerful quotes', 'life-changing quotes', 'word wisdom', 'daily inspiration']
      };
    }

    // Explore page
    else if (location.pathname === '/explore') {
      newSeoData = {
        ...newSeoData,
        title: 'Explore Inspiring Words - Trending Quotes & Popular Authors | Pekikkan',
        description: 'Explore trending quotes and discover powerful words that inspire. Browse quotes by category, find popular authors, and join our community spreading inspiration through words.',
        keywords: ['explore quotes', 'trending words', 'popular quotes', 'quote categories', 'famous authors', 'inspire through words', 'word discovery']
      };
    }

    // Post page
    else if (location.pathname === '/post') {
      newSeoData = {
        ...newSeoData,
        title: 'Share Inspiring Words - Post Motivational Quotes | Pekikkan',
        description: 'Share your favorite inspiring words with our global community. Help inspire the world through powerful quotes and motivational messages that transform lives.',
        keywords: ['share quotes', 'post inspiring words', 'submit quotes', 'inspire community', 'motivational sharing', 'spread inspiration']
      };
    }

    // Profile page
    else if (location.pathname === '/profile') {
      newSeoData = {
        ...newSeoData,
        title: 'My Inspiring Words Collection - Saved Quotes & Profile | Pekikkan',
        description: 'Manage your collection of inspiring words. View saved quotes, track your favorite motivational content, and see how you\'re helping inspire the world through words.',
        keywords: ['profile', 'saved quotes', 'inspiring words collection', 'quote collection', 'personal inspiration', 'word favorites']
      };
    }

    // Individual quote page
    if (quote) {
      const truncatedContent = quote.content.length > 100 
        ? `${quote.content.substring(0, 100)}...` 
        : quote.content;
      
      newSeoData = {
        ...newSeoData,
        title: `"${truncatedContent}" - ${quote.author} | Inspire through Words`,
        description: `${quote.content} - Inspiring words by ${quote.author}. Share this powerful quote and help inspire the world through meaningful words and wisdom.`,
        keywords: [
          'quote by ' + quote.author.toLowerCase(),
          quote.author.toLowerCase() + ' quotes',
          'inspiring words',
          'motivational quotes',
          'powerful words',
          'inspire through words',
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
        title: `${author} Inspiring Words - Motivational Quotes by ${author} | Pekikkan`,
        description: `Discover the most inspiring words by ${author}. Read, save, and share powerful quotes that help inspire the world through meaningful wisdom and motivation.`,
        keywords: [
          author.toLowerCase() + ' quotes',
          'quotes by ' + author.toLowerCase(),
          author.toLowerCase() + ' inspiring words',
          'motivational quotes',
          'powerful words',
          'inspire through words',
          'author wisdom'
        ]
      };
    }

    // Category page
    if (category) {
      newSeoData = {
        ...newSeoData,
        title: `${category} Inspiring Words - Motivational ${category} Quotes | Pekikkan`,
        description: `Explore the most inspiring ${category.toLowerCase()} words. Find motivation and inspiration in our curated collection of powerful ${category.toLowerCase()} quotes that transform lives.`,
        keywords: [
          category.toLowerCase() + ' quotes',
          'inspiring ' + category.toLowerCase() + ' words',
          category.toLowerCase() + ' motivation',
          'quotes about ' + category.toLowerCase(),
          'inspire through words',
          'motivational quotes',
          'powerful words'
        ]
      };
    }

    setSeoData(newSeoData);
  }, [location, quote, author, category]);

  return seoData;
};